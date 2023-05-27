module.exports = (sequelize, DataTypes) => {
    
    const Answers = sequelize.define("answers", {
      
      questionOneAgree: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      questionOneWhy: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      questionTwoAgree: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      questionTwoWhy: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      questionThreeAgree: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      questionThreeWhy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      origLanguage: {
        type: DataTypes.STRING,
      },

      sessionId: {
        type: DataTypes.STRING,
        allowNull: false
      }

    });
    
    Answers.associate = (models) => {
      Answers.belongsTo(models.statements, { foreignKey: 'statementId', as: 'statement' });
    };

    return Answers;
};