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
  from: `RoomsWithLoveNKY Website<noreply@${mailgunDomain}>`,
  subject: 'Pickup request'
};

const invalidAttachment = {
  statusCode: 400,
  body: 'Invalid attachment'
};

function isValidPicture(attachment) {
  const type = getImageType(attachment.content);
  return type;
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      body: 'Method Not Allowed'
    };
  }

  const fields = await parseMultipartForm(event);

  const requiredFields = [
    'name', 'phone', 'email',
    'street', 'city', 'state', 'zip',
    'schedule-preference', 'message',
    'picture1'
  ];

  const missingField = requiredFields.find(fieldName => {
    return !fields[fieldName];
  });

  if (missingField) {
    return {
      statusCode: 400,
      body: `"${missingField}" is required`
    }
  }

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

  if (!isValidPicture(fields.picture1)) {
    return invalidAttachment;
  }

  const mail = {
    ...mailTemplate,
    text: messageBody,
    attachments: [fields.picture1]
  };

  if (fields.picture2) {
    if (!isValidPicture(fields.picture2)) {
      return invalidAttachment;
    }

    mail.attachments.push(fields.picture2);
  }

  if (fields.picture3) {
    if (!isValidPicture(fields.picture3)) {
      return invalidAttachment;
    }

    mail.attachments.push(fields.picture3);
  }

  try {
    const info = await transporter.sendMail(mail);
    return {
      statusCode: 200,
      body: info.message
    };
  } catch(error) {
    console.log(error);
    return {
      statusCode: 500
    };
  }


};
