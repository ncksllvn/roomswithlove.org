const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const {
  MAILGUN_API_KEY: mailgunApiKey,
  MAILGUN_DOMAIN: mailgunDomain
} = process.env;

const transporter = nodemailer.createTransport(
  mg({
    auth: {
      api_key: mailgunApiKey,
      domain: mailgunDomain
    }
  })
);

module.exports = transporter;
