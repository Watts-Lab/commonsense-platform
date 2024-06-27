module.exports = (sequelize, DataTypes) => {
    const statements_subset = sequelize.define("statements_subset", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      statement: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      statementSource: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      origLanguage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      published: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      statementMedian: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      statementCategory: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
    return statements_subset;
  };
  