import { DataTypes, Sequelize } from 'sequelize';

export default function defineStatements(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define('statements', {
    statement: {
      type: dataTypes.TEXT,
      allowNull: false,
    },
    statementSource: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    origLanguage: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    published: {
      type: dataTypes.BOOLEAN,
      allowNull: true,
    },
    statementMedian: {
      type: dataTypes.DOUBLE,
      allowNull: true,
    },
    statementCategory: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    parentId: {
      type: dataTypes.INTEGER,
      allowNull: true,
    },
    statement_zh: {
      type: dataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    statement_ru: {
      type: dataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    statement_pt: {
      type: dataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    statement_ja: {
      type: dataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    statement_hi: {
      type: dataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    statement_fr: {
      type: dataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    statement_es: {
      type: dataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    statement_bn: {
      type: dataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    statement_ar: {
      type: dataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
  });
}
