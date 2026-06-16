import { DataTypes, Sequelize } from 'sequelize';

export default function defineAnswers(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define('answers', {
    statementId: {
      type: dataTypes.INTEGER,
      allowNull: true,
    },
    statement_number: {
      type: dataTypes.INTEGER,
      allowNull: true,
    },
    I_agree: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
    },
    I_agree_reason: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    others_agree: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
    },
    others_agree_reason: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    perceived_commonsense: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
    },
    clarity: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    origLanguage: {
      type: dataTypes.STRING,
    },
    clientVersion: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    sessionId: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });
}
