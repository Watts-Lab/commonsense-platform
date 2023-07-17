const nodemailer = require("nodemailer");
const process = require("process");

const aws = require("@aws-sdk/client-ses");

require("dotenv").config();

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID
  }
});

// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
  SES: { ses, aws },
});

const URL =
  process.env.NODE_ENV != "development"
    ? process.env.SITE_URL + "/login/"
    : "http://localhost:5173/login/";

const send_magic_link = async (email, link, which) => {


  if (which === "signup") {
    var subj = "Sign Up Common Sense Platform",
      body =
        "<p>Thank you for registering with the Common Sense Platform. We're excited to have you on board! To get started, please confirm your account by clicking on the link below:</p><p>" +
        (URL + email + "/" + link) +
        "</p><p>Please ensure that you do not share this link with anyone, as it is unique to your account.</p>" +
        "<p>We look forward to your active participation on the Common Sense Platform.</p>";
  } else {
    var subj = "Common Sense Platform sign in link",
      body =
        "<p>Welcome back to the Common Sense Platform. Please click on the link below to login: </p><p>" +
        (URL + email + "/" + link) +
        "</p><p>Please ensure that you do not share this link with anyone, as it is unique to your account.</p>" +
        "<p>We look forward to your active participation on the Common Sense Platform.</p>";
  }

  const mailOptions = {
    from: "no-reply@commonsensicality.org",
    to: email,
    subject: subj,
    html: body,
    ses: {
      // optional extra arguments for SendRawEmail
      Tags: [
        {
          Name: "Project",
          Value: "commonsense",
        },
      ],
    },
  };


  try {
    const response = await transporter.sendMail(mailOptions, (err, info) => {
      console.log(info.envelope);
      console.log(info.messageId);
    });
    // console.log(response);
    return { ok: true, message: "email sent" };
  } catch (err) {
    console.log("Something didn't work out", err);
    return { ok: false, message: err };
  }
};








module.exports = { send_magic_link };
