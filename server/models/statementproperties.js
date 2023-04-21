module.exports = (sequelize, DataTypes) => {
    
    const StatementProperties = sequelize.define("statementproperties", {
      
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },

      available: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
      
    });

    StatementProperties.associate = (models) => {
        StatementProperties.belongsTo(models.statements);
    };
  
    return StatementProperties;
  };