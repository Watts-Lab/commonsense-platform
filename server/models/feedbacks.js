
module.exports = (sequelize, DataTypes) => {
  const Feedbacks = sequelize.define("feedbacks", {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return Feedbacks;
};
