"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        defaultValue: "Anonymous",
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      magicLink: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false,
        defaultValue: () => uuidv4(),
      },
      sessionId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      magicLinkExpired: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
