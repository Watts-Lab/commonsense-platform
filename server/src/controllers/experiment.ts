import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import {
  answers,
  countryblock,
  experiments as experimentModel,
} from '../db/models';
import experiments from '../survey/experiments';
import {
  createExperiment,
  updateExperiment,
} from '../survey/experiments/utils/save-experiment';
import { saveIndividualDB } from '../survey/experiments/utils/save-individual';
import { GetStatementsWeighted } from '../survey/treatments/weighted-random.treatment';
import { stringy } from '../survey/treatments/utils/id-generator';
import { sendMetaEvent } from './meta';

export const returnStatements = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const language = (req.query.language as string) || 'en';

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const sessionId = req.query.sessionId as string;

  // 1. Resume any existing unfinished experiment for this session FIRST.
  //
  // This must happen before running treatment assigners: some assigners have
  // side effects (e.g. the country-bundle assigner increments a block's
  // assignedCount), so running them on a resume/refresh would wrongly bump
  // counters and pick a treatment we then throw away.
  try {
    const unfinishedExperiment = await experimentModel.findOne({
      where: {
        sessionId,
        finished: false,
      },
      order: [['createdAt', 'DESC']],
    });

    if (unfinishedExperiment) {
      const experimentAnswers = await answers.findAll({
        where: {
          sessionId,
          createdAt: {
            [Op.gte]: unfinishedExperiment.get('createdAt') as Date,
          },
        },
      });

      const statementList = unfinishedExperiment.get('statementList') as Array<{
        id: number;
        statement: string;
      }>;
      const statementsWithAnswers = statementList.map((statement) => {
        const answersForThisStatement = experimentAnswers.filter(
          (ans) => ans.get('statementId') === statement.id,
        );

        return {
          ...statement,
          answereSaved: answersForThisStatement.length > 0,
        };
      });

      res.json({
        statements: statementsWithAnswers,
        experimentId: unfinishedExperiment.get('id'),
        experimentType: unfinishedExperiment.get('experimentType'),
        isResumed: true,
      });
      return;
    }
  } catch (_error) {}

  // 2. No experiment to resume: filter treatments down to those valid for this
  // request.
  const validExperiments = (experiments as any[])
    .flatMap((experiment) =>
      experiment.treatments.map((treatment: any) => ({
        experiment_name: experiment.experimentName,
        experiment_assigner: experiment.treatmentAssigner,
        experiment_priority: experiment.priority || 0,
        validity: () => true,
        ...treatment,
      })),
    )
    .filter((treatment) => treatment.validity(req, treatment.params));

  const groupedExperiments = validExperiments.reduce(
    (acc, experiment) => {
      if (!acc[experiment.experiment_name]) {
        acc[experiment.experiment_name] = {
          experiment_assigner: experiment.experiment_assigner,
          experiment_priority: experiment.experiment_priority,
          experiment_valid_treatments: [] as any[],
        };
      }
      acc[experiment.experiment_name].experiment_valid_treatments.push(
        experiment,
      );
      return acc;
    },
    {} as Record<string, any>,
  );

  // Run each experiment's assigner (may have side effects, e.g. counter bumps).
  for (const experimentName of Object.keys(groupedExperiments)) {
    const experiment = groupedExperiments[experimentName];
    const assignedTreatment = await experiment.experiment_assigner(
      experiment.experiment_valid_treatments,
      req,
    );

    if (assignedTreatment) {
      groupedExperiments[experimentName].assigned_treatment = assignedTreatment;
    } else {
      delete groupedExperiments[experimentName];
    }
  }

  // 3. Pick which eligible experiment to run.
  let randomExperiment: any;

  const eligible = Object.values(groupedExperiments) as any[];

  if (eligible.length === 0) {
    // Nothing eligible: fall back to the default weighted-random treatment.
    randomExperiment = {
      assigned_treatment: {
        experiment_name: 'default',
        params: {
          sessionId,
          validStatementList: [],
          numberOfStatements: 15,
        },
        function: GetStatementsWeighted as any,
        validity: () => true,
      },
    };
  } else {
    // Experiments can declare a `priority` (default 0). The highest priority
    // wins; ties are broken randomly so equal-priority experiments stay evenly
    // sampled. This keeps precedence rules in the experiment modules themselves
    // rather than hardcoding experiment names here.
    const highestPriority = Math.max(
      ...eligible.map((e) => e.experiment_priority),
    );
    const topExperiments = eligible.filter(
      (e) => e.experiment_priority === highestPriority,
    );
    randomExperiment =
      topExperiments[Math.floor(Math.random() * topExperiments.length)];
  }

  const result = await randomExperiment.assigned_treatment.function({
    ...randomExperiment.assigned_treatment.params,
    language,
    sessionId,
  });

  delete req.query.sessionId;

  const experimentData = {
    sessionId,
    experimentId: stringy(randomExperiment.assigned_treatment.params),
    experimentType: randomExperiment.assigned_treatment.experiment_name,
    experimentInfo: randomExperiment.assigned_treatment,
    statementList: result.answer,
    urlParams: stringy(req.query) ? stringy(req.query) : null,
    finished: false,
  };

  try {
    const experiment = await createExperiment(experimentData);

    res.json({
      statements: result.answer,
      experimentId: experiment.get('id'),
      experimentType: experiment.get('experimentType'),
    });
    return;
  } catch (_error) {
    res.status(500).json({ error: 'Failed to create experiment' });
    return;
  }
};

export const saveIndividual = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const individualData = {
    sessionId: req.body.sessionId,
    informationType: req.body.informationType,
    experimentInfo: req.body.experimentInfo,
    urlParams: req.query.source ? req.query.source : null,
    finished: true,
  };

  saveIndividualDB(individualData).catch(() => {});

  res.json({ ok: true });
};

export const saveExperiment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const fbp = req.cookies?._fbp || undefined;
  const fbc = req.cookies?._fbc || undefined;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const experimentId = req.body.experimentId as number;

  const forwarded = req.headers['x-forwarded-for'];
  const clientIp =
    req.session?.ip ||
    (Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded?.split(',')[0]?.trim()) ||
    req.socket?.remoteAddress;

  const userAgent = req.headers['user-agent'];
  const eventSourceUrl = req.headers.referer || req.body.eventSourceUrl;

  try {
    await updateExperiment(experimentId, { finished: true });

    // For country-targeted bundles, bump the block's completedCount. Kept as a
    // maintained counter (like assignedCount) so we never aggregate the large
    // experiments table. Non-fatal: never block completion on a counter update.
    try {
      const experiment = await experimentModel.findByPk(experimentId, {
        attributes: ['experimentType', 'experimentInfo'],
      });
      const experimentInfo = experiment?.get('experimentInfo') as
        { countryBlockId?: number } | null | undefined;
      const countryBlockId = experimentInfo?.countryBlockId;
      if (
        experiment?.get('experimentType') === 'country-bundle' &&
        countryBlockId
      ) {
        await countryblock.increment('completedCount', {
          where: { id: countryBlockId },
        });
      }
    } catch (_counterError) {}

    try {
      await sendMetaEvent({
        eventName: 'SurveyCompleted',
        fbp,
        fbc,
        eventId: experimentId,
        clientIp,
        userAgent,
        eventSourceUrl,
      });
    } catch (_metaError) {}

    res.json({ ok: true });
    return;
  } catch (_error) {
    res.status(400).json({ error: 'Failed to save experiment' });
    return;
  }
};
