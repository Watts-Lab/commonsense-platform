import { Sequelize, DataTypes } from 'sequelize';
import { database } from '../../config/config';
import defineStatements from './statements';
import defineStatementProperties from './statementproperties';
import defineAnswers from './answers';
import defineUserStatements from './userstatements';
import defineExperiments from './experiments';
import defineIpAddress from './ipaddress';
import defineCountryBlock from './countryblock';
import defineIndividuals from './individual';
import defineDailyExperiment from './dailyexperiment';
import defineUsers from './users';
import defineFeedbacks from './feedbacks';
import defineTreatments from './treatments';
import defineUserTreatments from './usertreatments';
import defineStatementCountryRating from './statementcountryrating';

const env = process.env.NODE_ENV || 'development';
const config = database[env];

if (!config) {
  throw new Error(`Configuration for environment "${env}" is not defined.`);
}

const sequelize = new Sequelize({
  ...config,
  dialect: config.dialect,
  storage: config.storage,
  database: config.database,
  username: config.username,
  password: config.password,
  host: config.host,
  port: config.port ? Number(config.port) : undefined,
});

const statements = defineStatements(sequelize, DataTypes);
const statementproperties = defineStatementProperties(sequelize, DataTypes);
const answers = defineAnswers(sequelize, DataTypes);
const userstatements = defineUserStatements(sequelize, DataTypes);
const experiments = defineExperiments(sequelize, DataTypes);
const ipaddress = defineIpAddress(sequelize, DataTypes);
const countryblock = defineCountryBlock(sequelize, DataTypes);
const individuals = defineIndividuals(sequelize, DataTypes);
const dailyexperiment = defineDailyExperiment(sequelize, DataTypes);
const users = defineUsers(sequelize, DataTypes);
const feedbacks = defineFeedbacks(sequelize, DataTypes);
const treatments = defineTreatments(sequelize, DataTypes);
const usertreatments = defineUserTreatments(sequelize, DataTypes);
const statementcountryratings = defineStatementCountryRating(
  sequelize,
  DataTypes,
);

statements.hasMany(statementproperties, {
  foreignKey: 'statementId',
  onDelete: 'cascade',
});

statementproperties.belongsTo(statements, {
  foreignKey: 'statementId',
});

// Answers are the core survey data. The FK to statements uses RESTRICT on
// delete so a statement that has answers can never be removed (and answers are
// never orphaned).
statements.hasMany(answers, {
  foreignKey: 'statementId',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

answers.belongsTo(statements, {
  foreignKey: 'statementId',
  as: 'statement',
});

treatments.hasMany(usertreatments, {
  foreignKey: 'treatmentId',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

usertreatments.belongsTo(treatments, {
  foreignKey: 'treatmentId',
  as: 'treatment',
});

statements.hasMany(statementcountryratings, {
  foreignKey: 'statementId',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

statementcountryratings.belongsTo(statements, {
  foreignKey: 'statementId',
});

export const db = {
  Sequelize,
  sequelize,
  statements,
  statementproperties,
  answers,
  userstatements,
  experiments,
  ipaddress,
  countryblock,
  individuals,
  dailyexperiment,
  users,
  feedbacks,
  treatments,
  usertreatments,
  statementcountryratings,
};

export {
  Sequelize,
  sequelize,
  statements,
  statementproperties,
  answers,
  userstatements,
  experiments,
  ipaddress,
  countryblock,
  individuals,
  dailyexperiment,
  users,
  feedbacks,
  treatments,
  usertreatments,
  statementcountryratings,
};

export default db;
