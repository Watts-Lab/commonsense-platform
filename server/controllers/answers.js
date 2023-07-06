const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwt_secret = process.env.JWT_SECRET;
const { statements, users, answers } = require("../models");

const { header, body, validationResult } = require("express-validator");
