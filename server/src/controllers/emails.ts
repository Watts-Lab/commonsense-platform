import nodemailer from 'nodemailer';

const URL =
  process.env.NODE_ENV !== 'development'
    ? `${process.env.SITE_URL}/login/`
    : 'http://localhost:5173/login/';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth:
    process.env.NODEMAILER_EMAIL && process.env.NODEMAILER_PASSWORD
      ? {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASSWORD,
        }
      : undefined,
});

export async function send_magic_link(
  email: string,
  link: string,
  which?: string,
) {
  const subj =
    which === 'signup'
      ? 'Sign Up Common Sense Platform'
      : 'Common Sense Platform sign in link';

  const messageBody =
    which === 'signup'
      ? `<p>Thank you for registering with the Common Sense Platform. We're excited to have you on board! To get started, please confirm your account by clicking the link below:</p><p>${URL + email + '/' + link}</p>`
      : `<p>Welcome back to the Common Sense Platform. Please click the link below to login:</p><p>${URL + email + '/' + link}</p>`;

  const mailOptions = {
    from: 'no-reply@commonsensicality.org',
    to: email,
    subject: subj,
    html: messageBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { ok: true, message: 'email sent' };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}

export async function send_report(
  email: string,
  comment: string,
  type: string,
) {
  const mailOptions = {
    from: 'no-reply@commonsensicality.org',
    to: email,
    subject: 'Commonsense platform feedback',
    html: `<p>Here is the comment report from the Common Sense Platform:</p><p>${type} : ${comment}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { ok: true, message: 'email sent' };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}
