
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

    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    context: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    userEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return Feedbacks;
};
