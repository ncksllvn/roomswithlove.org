const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const getImageType = require('image-type');

const parseMultipartForm = require('./parseMultipartForm');

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

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "Method Not Allowed" };
  }

  const fields = await parseMultipartForm(event);

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

    const allValidImages = fields.attachments.every(attachment => {
      return getImageType(attachment.content);
    });

    if (!allValidImages) {
      console.log('One or more invalid attachments');
      return {
        statusCode: 400,
        body: 'One or more invalid attachments'
      };
    }

    mail.attachments = fields.attachments;
  }

  const info = await transporter.sendMail(mail);

  return {
    statusCode: 200,
    body: info.message
  };
};
