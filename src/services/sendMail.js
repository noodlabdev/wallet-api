const nodemailer = require('nodemailer');

const { EmailTypes } = require('../constants');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendMail = async (to, type, data = undefined) => {
  console.log(data); // eslint-disable-line no-console
  let subject, htmlBody; // eslint-disable-line one-var
  switch (type) {
    case EmailTypes.REGISTER:
      subject = 'Register success';
      htmlBody = `<b>Your account is registered in my web app.<a href='${process.env.FRONTEND_URI}/auth/login'>you can login now</a></b>`;
      break;

    default:
      break;
  }

  const emailContent = {
    to,
    subject,
    html: htmlBody,
  };

  try {
    transporter.sendMail(emailContent);
  } catch (error) {
    console.log(error); // eslint-disable-line no-console
  }
};
