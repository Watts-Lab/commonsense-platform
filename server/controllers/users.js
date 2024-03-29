const { users } = require("../models");
const jwt = require("jsonwebtoken");
const validator = require("validator");
require("dotenv").config();
const jwt_secret = process.env.JWT_SECRET;
const crypto = require("crypto");
const { send_magic_link } = require("./emails.js");
const { Op } = require("sequelize");

const register = async (email, sessionId) => {
  try {
    const newUser = {
      email: email,
      magicLink: crypto.randomBytes(64).toString("hex"),
      sessionId: sessionId,
    };

    let user = await users.create(newUser);

    // send magic link to email
    let sendEmail = send_magic_link(email, user.magicLink, "signup");

    return { ok: true, message: "User created" };
  } catch (error) {
    return { ok: false, error };
  }
};

const login = async (req, res) => {
  const { email, magicLink, surveySession } = req.body;

  if (!email)
    return res.json({ ok: false, message: "All fields are required" });
  if (!validator.isEmail(email))
    return res.json({ ok: false, message: "Invalid email provided" });

  try {
    let user = await users.findOne({ where: { email: email } });
    if (!user) {
      let reg = await register(email, surveySession);
      res.send({
        ok: true,
        message: "Click the link in the email to sign in",
      });
    } else if (!magicLink) {
      try {
        user = await user.update({
          magicLink: crypto.randomBytes(64).toString("hex"),
          magicLinkExpired: false,
        });
        // send email with magic link
        send_magic_link(email, user.magicLink);
        res.send({
          ok: true,
          message: "Click the link in the email to sign in",
        });
      } catch {}
    } else if (user.magicLink === magicLink && !user.magicLinkExpired) {
      // create token
      const token = jwt.sign(user.toJSON(), jwt_secret, { expiresIn: "12h" }); //{expiresIn:'365d'}
      const sessionId = user.sessionId ? user.sessionId : "";

      await user.update({ magicLinkExpired: true });
      res.json({ ok: true, message: "Welcome back", token, email, sessionId });
    } else {
      return res.json({
        ok: false,
        message: "Magic link expired or incorrect",
      });
    }
  } catch (error) {
    res.json({ ok: false, error });
  }
};

const verify_token = (req, res) => {
  const token = req.headers.authorization;
  jwt.verify(token, jwt_secret, (err, succ) => {
    err
      ? res.json({ ok: false, message: "Something went wrong" })
      : res.json({ ok: true, email: succ.email, sessionId: succ.sessionId });
  });
};

const delete_account = async (req, res) => {
  const token = req.headers.authorization;
  jwt.verify(token, jwt_secret, (err, succ) => {
    if (!err) {
      users
        .destroy({
          where: {
            email: succ.email,
            sessionId: succ.sessionId,
          },
        })
        .then(() => {
          res.json({ ok: true, message: "User deleted" });
        })
        .catch((err) => {
          res.json({ ok: false, message: "Something went wrong" });
        });
    } else {
      res.json({ ok: false, message: "Something went wrong" });
    }
  });
};

module.exports = { login, verify_token, delete_account };
