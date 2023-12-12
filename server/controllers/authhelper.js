const { users } = require("../models");
const jwt = require("jsonwebtoken");
const validator = require("validator");
require("dotenv").config();
const jwt_secret = process.env.JWT_SECRET;
const { Op } = require("sequelize");

const getUserIdFromToken = async (token) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error("No token provided"));
    }
    jwt.verify(token, jwt_secret, async (err, decoded) => {
      if (err) {
        return reject(new Error("Invalid token"));
      }
      try {
        const user = await users.findOne({ where: { email: decoded.email } });
        if (!user) {
          return reject(new Error("User not found"));
        }
        resolve(user.id);
      } catch (error) {
        reject(error);
      }
    });
  });
};

const getSessionIdFromToken = async (token) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error("No token provided"));
    }
    jwt.verify(token, jwt_secret, async (err, decoded) => {
      if (err) {
        return reject(new Error("Invalid token"));
      }
      try {
        const user = await users.findOne({ where: { email: decoded.email } });
        if (!user) {
          return reject(new Error("User not found"));
        }
        resolve(user.sessionId);
      } catch (error) {
        reject(error);
      }
    });
  });
};

module.exports = {
  getUserIdFromToken,
  getSessionIdFromToken,
};
