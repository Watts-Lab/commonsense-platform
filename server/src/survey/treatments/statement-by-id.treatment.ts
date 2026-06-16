import { statements } from '../../db/models';
import { seededShuffle } from './utils/seeded-shuffle';
import { stringy } from './utils/id-generator';

interface StatementByIdParams {
  ids: number[];
  language?: string;
  sessionId?: string;
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

export async function GetStatementById({
  ids,
  language,
  sessionId,
}: StatementByIdParams) {
  if (!ids || ids.length === 0) {
    throw new Error('Missing required parameter: ids');
  }

  const selectedColumn = language
    ? languageMap[language] || 'statement'
    : 'statement';

  const statementsText = await statements.findAll({
    where: { id: ids },
    attributes: ['id', [selectedColumn, 'statement']],
  });

  const plainStatements = statementsText.map((row) => row.toJSON()) as Array<{
    id: number;
    statement: string;
  }>;

  const shuffledStatements = sessionId
    ? seededShuffle(plainStatements, sessionId)
    : plainStatements;

  return {
    id: stringy({ ids }),
    description: 'GetStatementById',
    answer: shuffledStatements,
  };
}
