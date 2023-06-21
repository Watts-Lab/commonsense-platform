const nodemailer = require("nodemailer");
const process = require("process");

require("dotenv").config();

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

const URL =
  process.env.NODE_ENV != "development"
    ? process.env.SITE_URL + "/login/"
    : "http://localhost:5173/login/";

const send_magic_link = async (email, link, which) => {
  
  console.log("node env:", process.env.NODE_ENV);

  if (which === "signup") {
    var subj = "Sign Up Common Sense Platform",
      body =
        "<p>Thank you for registering with the Common Sense Platform. We're excited to have you on board! To get started, please confirm your account by clicking on the link below:</p><p>" +
        (URL + email + "/" + link) +
        "</p><p>Please ensure that you do not share this link with anyone, as it is unique to your account.</p>" +
        "<p>We look forward to your active participation on the Common Sense Platform.</p>";
  } else {
    var subj = "Your sign in link",
      body =
        "<p>Welcome back to the Common Sense Platform. Please click on the link below to login: </p><p>" +
        (URL + email + "/" + link) +
        "</p><p>Please ensure that you do not share this link with anyone, as it is unique to your account.</p>" +
        "<p>We look forward to your active participation on the Common Sense Platform.</p>";
  }
  const mailOptions = {
    to: email,
    from: process.env.NODEMAILER_EMAIL,
    subject: subj,
    html: body,
  };

  try {
    const response = await transport.sendMail(mailOptions);
    // console.log(response);
    return { ok: true, message: "email sent" };
  } catch (err) {
    console.log("Something didn't work out", err);
    return { ok: false, message: err };
  }
};

module.exports = { send_magic_link };
