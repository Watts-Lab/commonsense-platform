import { QueryTypes } from 'sequelize';
import { sequelize } from '../../db/models';
import { seededShuffle } from './utils/seeded-shuffle';
import { stringy } from './utils/id-generator';

interface WeightedParams {
  sessionId: string;
  validStatementList?: number[];
  numberOfStatements?: number;
  language?: string;
}

const languageMap: Record<string, string> = {
  en: 'statement',
  zh: 'statement_zh',
  ru: 'statement_ru',
  pt: 'statement_pt',
  ja: 'statement_ja',
  hi: 'statement_hi',
  fr: 'statement_fr',
  es: 'statement_es',
  bn: 'statement_bn',
  ar: 'statement_ar',
};

export async function GetStatementsWeighted({
  sessionId,
  validStatementList = [],
  numberOfStatements = 1,
  language,
}: WeightedParams) {
  try {
    if (
      language &&
      !Object.prototype.hasOwnProperty.call(languageMap, language)
    ) {
      throw new Error(`Unsupported language code: ${language}`);
    }

    const selectedColumn = languageMap[language || 'en'] || 'statement';

    let query = `
    WITH weighted_questions AS (
      SELECT
        statements.id,
        statements.${selectedColumn} AS statement,
        1.0 / (COUNT(answers.statementId) + 1) AS weight
      FROM
        statements
      LEFT JOIN
        answers ON statements.id = answers.statementId AND answers.sessionId NOT IN (:sessionId)
      WHERE
        statements.published = true
      GROUP BY
        statements.id
    )
    SELECT
      id,
      statement,
      -LOG(RAND()) / weight AS priority
    FROM
      weighted_questions
    ORDER BY
      priority ASC
    LIMIT
      :numberOfStatements;
  `;

    const replacements: Record<string, unknown> = {
      sessionId,
      numberOfStatements,
    };

    if (validStatementList.length > 0) {
      query = query.replace(
        'GROUP BY\n        statements.id',
        'GROUP BY\n        statements.id HAVING statements.id IN (:validStatementList)',
      );
      replacements.validStatementList = validStatementList;
    }

    const results = (await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    })) as Array<{ id: number; statement: string }>;

    const shuffledResults = sessionId
      ? seededShuffle(results, sessionId)
      : results;

    return {
      id: stringy({
        sessionId,
        validStatementList,
        numberOfStatements,
        language,
      }),
      description: 'GetStatementsWeighted',
      answer: shuffledResults.map((result) => ({
        id: result.id,
        statement: result.statement,
      })),
    };
  } catch (error) {
    console.error('Error in GetStatementsWeighted:', error);
    throw new Error('An error occurred while retrieving weighted statements.');
  }
}
