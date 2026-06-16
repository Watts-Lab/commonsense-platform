import { DataTypes, Sequelize } from 'sequelize';

export default function defineUsers(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define('users', {
    name: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    magicLink: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    sessionId: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    magicLinkExpired: {
      type: dataTypes.BOOLEAN,
      allowNull: true,
    },
  });
}
