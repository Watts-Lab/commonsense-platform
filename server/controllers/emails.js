const nodemailer = require("nodemailer");
const process = require("process");

const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

require("dotenv").config();

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

//create Nodemailer SES transporter
const transporter = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand },
});

// Base URL logic
const URL =
  process.env.NODE_ENV !== "development"
    ? `${process.env.SITE_URL}/login/`
    : "http://localhost:5173/login/";

// Magic link sender
const send_magic_link = async (email, link, which) => {
  const subj =
    which === "signup"
      ? "Sign Up Common Sense Platform"
      : "Common Sense Platform sign in link";

  const messageBody =
    which === "signup"
      ? `<p>Thank you for registering with the Common Sense Platform. We're excited to have you on board! To get started, please confirm your account by clicking the link below:</p>
         <p>${URL + email + "/" + link}</p>
         <p>Please ensure that you do not share this link with anyone, as it is unique to your account.</p>
         <p>We look forward to your active participation on the Common Sense Platform.</p>`
      : `<p>Welcome back to the Common Sense Platform. Please click the link below to login:</p>
         <p>${URL + email + "/" + link}</p>
         <p>Please ensure that you do not share this link with anyone, as it is unique to your account.</p>
         <p>We look forward to your active participation on the Common Sense Platform.</p>`;

  const mailOptions = {
    from: "no-reply@commonsensicality.org",
    to: email,
    subject: subj,
    html: messageBody,
    ses: {
      EmailTags: [
        {
          Name: "Project",
          Value: "commonsense",
        },
      ],
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(info.envelope);
    console.log(info.messageId);
    return { ok: true, message: "email sent" };
  } catch (err) {
    console.error("Email send failed:", err);
    return { ok: false, message: err.message || err };
  }
};

// Report sender
const send_report = async (email, comment, type) => {
  const subj = "Commonsense platform feedback";
  const body = `
    <p>Here is the comment report from the Common Sense Platform:</p>
    <p>${type} : ${comment}</p>
  `;

  const mailOptions = {
    from: "no-reply@commonsensicality.org",
    to: email,
    subject: subj,
    html: body,
    ses: {
      EmailTags: [
        {
          Name: "Project",
          Value: "commonsense",
        },
      ],
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(info.envelope);
    console.log(info.messageId);
    return { ok: true, message: "email sent" };
  } catch (err) {
    console.error("Email send failed:", err);
    return { ok: false, message: err.message || err };
  }
};

module.exports = { send_magic_link, send_report };
