import { DataTypes, Sequelize } from 'sequelize';

export default function defineStatementCountryRating(
  sequelize: Sequelize,
  dataTypes: typeof DataTypes,
) {
  return sequelize.define(
    'statementcountryrating',
    {
      statementId: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },

      // ISO 3166-1 numeric country code, zero-padded to 3 digits (e.g. "818").
      // Only ever populated for the Besample-recruitable country set.
      countryCode: {
        type: dataTypes.STRING(3),
        allowNull: false,
      },

      // Confirmed rating count for this (statement, country) cell -- n(i,j)
      // from the row-priority dynamic-frontier recruitment strategy. Pending
      // (in-flight) reservations are derived live, not persisted here.
      confirmedCount: {
        type: dataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'statementcountryratings',
      indexes: [
        { unique: true, fields: ['statementId', 'countryCode'] },
        { fields: ['countryCode', 'confirmedCount'] },
      ],
    },
  );
}
