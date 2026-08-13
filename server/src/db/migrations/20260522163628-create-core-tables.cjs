'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('statements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      statement: { type: Sequelize.TEXT, allowNull: false },
      statementSource: { type: Sequelize.STRING, allowNull: false },
      origLanguage: { type: Sequelize.STRING, allowNull: false },
      published: { type: Sequelize.BOOLEAN, allowNull: true },
      statementMedian: { type: Sequelize.DOUBLE, allowNull: true },
      statementCategory: { type: Sequelize.STRING, allowNull: true },
      parentId: { type: Sequelize.INTEGER, allowNull: true },
      statement_zh: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      statement_ru: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      statement_pt: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      statement_ja: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      statement_hi: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      statement_fr: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      statement_es: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      statement_bn: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      statement_ar: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('statementproperties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      available: { type: Sequelize.BOOLEAN, defaultValue: false },
      statementId: {
        type: Sequelize.INTEGER,
        references: { model: 'statements', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('answers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // FK to statements is RESTRICT: answers are the core survey data and must
      // never be deleted or orphaned when a statement is removed.
      statementId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'statements', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      I_agree: { type: Sequelize.BOOLEAN, allowNull: false },
      I_agree_reason: { type: Sequelize.STRING, allowNull: false },
      others_agree: { type: Sequelize.BOOLEAN, allowNull: false },
      others_agree_reason: { type: Sequelize.STRING, allowNull: false },
      perceived_commonsense: { type: Sequelize.BOOLEAN, allowNull: false },
      clarity: { type: Sequelize.STRING, allowNull: true },
      origLanguage: { type: Sequelize.STRING, allowNull: true },
      clientVersion: { type: Sequelize.STRING, allowNull: true },
      sessionId: { type: Sequelize.STRING, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('experiments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sessionId: { type: Sequelize.STRING, allowNull: false },
      experimentId: { type: Sequelize.STRING, allowNull: false },
      experimentType: { type: Sequelize.STRING, allowNull: false },
      experimentInfo: { type: Sequelize.JSON, allowNull: true },
      statementList: { type: Sequelize.JSON, allowNull: true },
      urlParams: { type: Sequelize.TEXT, allowNull: true },
      finished: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Anonymous',
      },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      magicLink: { type: Sequelize.STRING, allowNull: true },
      sessionId: { type: Sequelize.STRING, allowNull: true, unique: true },
      magicLinkExpired: { type: Sequelize.BOOLEAN, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('userstatements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      statementText: { type: Sequelize.TEXT, allowNull: false },
      statementProperties: { type: Sequelize.JSON, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('feedbacks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: { type: Sequelize.STRING, allowNull: false },
      comment: { type: Sequelize.TEXT, allowNull: true },
      // NOTE: These three columns are missing from the legacy production
      // `feedbacks` table (which predates the migration system). The
      // 20260814000000-reconcile-production-schema migration adds them there.
      sessionId: { type: Sequelize.STRING, allowNull: true },
      ipAddress: { type: Sequelize.STRING, allowNull: true },
      userAgent: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('treatments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      code: { type: Sequelize.UUID, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      params: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('usertreatments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sessionId: { type: Sequelize.STRING, allowNull: false },
      treatmentId: { type: Sequelize.INTEGER, allowNull: false },
      statementList: { type: Sequelize.TEXT, allowNull: true },
      finished: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      urlParams: { type: Sequelize.STRING, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('ipaddresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sessionId: { type: Sequelize.STRING, allowNull: false },
      lastSessionId: { type: Sequelize.STRING, allowNull: true },
      ipAddress: { type: Sequelize.STRING, allowNull: false },
      userAgent: { type: Sequelize.TEXT, allowNull: true },
      country: { type: Sequelize.STRING(2), allowNull: true },
      region: { type: Sequelize.STRING, allowNull: true },
      city: { type: Sequelize.STRING, allowNull: true },
      timezone: { type: Sequelize.STRING, allowNull: true },
      firstSeen: { type: Sequelize.DATE, allowNull: false },
      lastSeen: { type: Sequelize.DATE, allowNull: false },
      visitCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      isBlocked: { type: Sequelize.BOOLEAN, defaultValue: false },
      metadata: { type: Sequelize.JSON, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('individuals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sessionId: { type: Sequelize.STRING, allowNull: false },
      informationType: { type: Sequelize.STRING, allowNull: false },
      experimentInfo: { type: Sequelize.JSON, allowNull: true },
      urlParams: { type: Sequelize.STRING, allowNull: true },
      finished: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('dailyexperiments', {
      date: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DATEONLY,
      },
      statementIds: { type: Sequelize.JSON, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('countryblocks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      country: { type: Sequelize.STRING, allowNull: false },
      countryCode: { type: Sequelize.STRING(3), allowNull: false },
      block: { type: Sequelize.INTEGER, allowNull: false },
      statementIds: { type: Sequelize.JSON, allowNull: false },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      assignedCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      completedCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addIndex('experiments', ['experimentType']);
    await queryInterface.addIndex('experiments', ['experimentId']);
    await queryInterface.addIndex('experiments', [
      'sessionId',
      'experimentType',
    ]);
    await queryInterface.addIndex('experiments', ['finished']);
    await queryInterface.addIndex('ipaddresses', ['sessionId']);
    await queryInterface.addIndex('ipaddresses', ['ipAddress']);
    await queryInterface.addIndex('ipaddresses', ['firstSeen']);
    await queryInterface.addIndex('ipaddresses', ['sessionId', 'ipAddress'], {
      unique: true,
    });
    await queryInterface.addIndex('dailyexperiments', ['date']);
    await queryInterface.addIndex('countryblocks', ['countryCode', 'block'], {
      unique: true,
    });
    await queryInterface.addIndex('countryblocks', [
      'countryCode',
      'enabled',
      'assignedCount',
    ]);
    await queryInterface.addIndex('countryblocks', [
      'countryCode',
      'enabled',
      'completedCount',
      'block',
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('countryblocks');
    await queryInterface.dropTable('dailyexperiments');
    await queryInterface.dropTable('individuals');
    await queryInterface.dropTable('ipaddresses');
    await queryInterface.dropTable('usertreatments');
    await queryInterface.dropTable('treatments');
    await queryInterface.dropTable('feedbacks');
    await queryInterface.dropTable('userstatements');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('experiments');
    await queryInterface.dropTable('answers');
    await queryInterface.dropTable('statementproperties');
    await queryInterface.dropTable('statements');
  },
};
