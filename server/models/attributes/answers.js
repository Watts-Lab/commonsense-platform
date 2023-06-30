const { DataTypes } = require("sequelize");

module.exports = {
  I_agree: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },

  I_agree_reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  others_agree: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },

  others_agree_reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  perceived_commonsense: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },

  clarity: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  origLanguage: {
    type: DataTypes.STRING,
  },

  clientVersion: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};
