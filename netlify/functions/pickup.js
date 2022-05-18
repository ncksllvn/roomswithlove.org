const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const parseMultipartForm = require('./parseMultipartForm');

const {
  MAILGUN_API_KEY: mailgunApiKey,
  MAILGUN_DOMAIN: mailgunDomain
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
  to: 'ncksllvn@gmail.com',
  from: `RoomsWithLoveNKY Website<noreply@${mailgunDomain}>`,
  subject: 'New pickup request'
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "Method Not Allowed" };
  }

  const fields = await parseMultipartForm(event);

  const messageBody = `
    Name:
    ${fields.name}

    Address:
    ${fields.address}

    Phone number:
    ${fields.phone}

    Email:
    ${fields.email}

    Message:
    ${fields.message}
  `;

  const mail = {
    ...mailTemplate,
    text: messageBody
  };

  if (fields.picture) {

    console.log(fields.picture)

    mail.attachments = [{
      filename: fields.picture.filename,
      content: fields.picture.content.toString('utf8'),
      encoding: 'utf8'
    }];
  }

  const info = await transporter.sendMail(mail);

  return {
    statusCode: 200,
    body: info.message
  };
};
