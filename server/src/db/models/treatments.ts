import { DataTypes, Sequelize } from 'sequelize';

export default function defineTreatments(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define('treatments', {
    code: {
      type: dataTypes.UUID,
      allowNull: false,
      defaultValue: dataTypes.UUIDV4,
    },
    description: {
      type: dataTypes.TEXT,
      allowNull: true,
    },
    params: {
      type: dataTypes.TEXT,
      allowNull: true,
    },
  });
}
