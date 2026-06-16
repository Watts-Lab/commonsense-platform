import { Sequelize, DataTypes } from 'sequelize';
import { database } from '../../config/config';
import defineStatements from './statements';
import defineStatementProperties from './statementproperties';
import defineAnswers from './answers';
import defineUserStatements from './userstatements';
import defineExperiments from './experiments';
import defineIpAddress from './ipaddress';
import defineIndividuals from './individual';
import defineDailyExperiment from './dailyexperiment';
import defineUsers from './users';
import defineFeedbacks from './feedbacks';
import defineTreatments from './treatments';
import defineUserTreatments from './usertreatments';

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
const individuals = defineIndividuals(sequelize, DataTypes);
const dailyexperiment = defineDailyExperiment(sequelize, DataTypes);
const users = defineUsers(sequelize, DataTypes);
const feedbacks = defineFeedbacks(sequelize, DataTypes);
const treatments = defineTreatments(sequelize, DataTypes);
const usertreatments = defineUserTreatments(sequelize, DataTypes);

statements.hasMany(statementproperties, {
  foreignKey: 'statementId',
  onDelete: 'cascade',
});

statementproperties.belongsTo(statements, {
  foreignKey: 'statementId',
});

statements.hasMany(answers, {
  foreignKey: 'statement_number',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT',
});

answers.belongsTo(statements, {
  foreignKey: 'statement_number',
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

export const db = {
  Sequelize,
  sequelize,
  statements,
  statementproperties,
  answers,
  userstatements,
  experiments,
  ipaddress,
  individuals,
  dailyexperiment,
  users,
  feedbacks,
  treatments,
  usertreatments,
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
  individuals,
  dailyexperiment,
  users,
  feedbacks,
  treatments,
  usertreatments,
};

export default db;
