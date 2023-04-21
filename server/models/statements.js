module.exports = (sequelize, DataTypes) => {
    
    const Statements = sequelize.define("statements", {
      
      statement: {
        type: DataTypes.TEXT,
        allowNull: false
      },

      statementSource: {
        type: DataTypes.STRING,
        allowNull: false
      },

      origLanguage: {
        type: DataTypes.STRING,
        allowNull: false
      },

      published: {
        type: DataTypes.BOOLEAN
      }
    });
    
    Statements.associate = (models) => {
      
      Statements.hasMany(models.statementproperties, {
        onDelete: "cascade",
      });

      Statements.hasMany(models.answers, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      });
      
    };

    return Statements;
};