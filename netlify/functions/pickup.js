const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");

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

const from = `RoomsWithLoveNKY Website<noreply@${mailgunDomain}>`;

// @todo https://www.netlify.com/blog/2021/07/29/how-to-process-multipart-form-data-with-a-netlify-function/?_ga=2.9943221.1450757248.1652745541-1168716722.1652745541

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const params = new URLSearchParams(event.body);
  const mail = {
    from,
    to: 'ncksllvn@gmail.com',
    subject: 'New pickup request',
    text: params.get('message')
  };

  // { id, message, messageId }
  const info = await transporter.sendMail(mail);

  return {
    statusCode: 200,
    body: info.message
  };
};
