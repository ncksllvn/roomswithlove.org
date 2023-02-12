const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const Sentry = require('../helpers/sentry');
const parseMultipartForm = require('../helpers/parseMultipartForm');

const {
  MAILGUN_API_KEY: mailgunApiKey,
  MAILGUN_DOMAIN: mailgunDomain,
  EMAIL_RECIPIENTS: emailRecipients,
  EMAIL_BCC: emailBcc
} = process.env;

const transporter = nodemailer.createTransport(
  mg({
    auth: {
      api_key: mailgunApiKey,
      domain: mailgunDomain
    },
  })
);

const mailTemplate = {
  to: emailRecipients.split(','),
  bcc: emailBcc,
  from: `RoomsWithLove<noreply@${mailgunDomain}>`,
  subject: 'Pickup request'
};

const serverError = {
  statusCode: 500,
  body: 'An unknown error occurred'
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "Method Not Allowed" };
  }

  const fields = await parseMultipartForm(event, {
    mimeTypes: mime => mime.startsWith('image/')
  });

  const messageBody = `
    Name:
    ${fields.name}

    Phone number:
    ${fields.phone}

    Email:
    ${fields.email}

    Address:
    ${fields.street}
    ${fields.city}, ${fields.state} ${fields.zip}

    Schedule preference
    ${fields['schedule-preference']}

    Message:
    ${fields.message}
  `;

  const mail = {
    ...mailTemplate,
    text: messageBody
  };

  if (fields.attachments) {
    mail.attachments = fields.attachments;
  }

  try {
    const info = await transporter.sendMail(mail);
    return {
      statusCode: 200,
      body: info.message
    };
  } catch (error) {
    Sentry.captureException(error);
    return serverError;
  }
};
