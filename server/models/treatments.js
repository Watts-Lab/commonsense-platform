const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Treatments = sequelize.define("treatments", {
    code: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    params: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Treatments.associate = (models) => {
    Treatments.hasMany(models.usertreatments, {
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    });
  };

  return Treatments;
};
