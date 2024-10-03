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
    await send_magic_link(email, user.magicLink, "signup");
    return { ok: true, message: "User created", user };
  } catch (error) {
    return { ok: false, error };
  }
};

const login = async (req, res) => {
  const { email, magicLink, sessionId } = req.body;
  console.log(email, magicLink, sessionId);

  if (!email)
    return res.json({ ok: false, message: "All fields are required" });
  if (!validator.isEmail(email))
    return res.json({ ok: false, message: "Invalid email provided" });

  try {
    let user = await users.findOne({ where: { email: email } });
    if (!user) {
      let reg = await register(email, sessionId);
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
        await send_magic_link(email, user.magicLink);
        return res.send({
          ok: true,
          message: "Click the link in the email to sign in",
        });
      } catch (error) {
        return res.send({
          ok: false,
          message: "We could not send you a magic link. Please try again later",
        });
      }
    } else if (user.magicLink === magicLink && !user.magicLinkExpired) {
      const newSessionId = user.sessionId ? user.sessionId : sessionId;
      // if user sessionId field is empty give it a value and update the user
      if (!user.sessionId) {
        console.log("updating sessionId since it is null");
        user = await user.update({
          magicLinkExpired: true,
          sessionId: newSessionId,
        });
      } else {
        user = await user.update({ magicLinkExpired: true });
      }

      // create token
      const token = jwt.sign(user.toJSON(), jwt_secret, { expiresIn: "12h" });

      res.json({
        ok: true,
        message: "Welcome back",
        token,
        email,
        sessionId: newSessionId,
      });
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
