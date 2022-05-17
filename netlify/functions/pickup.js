const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");

const transporter = nodemailer.createTransport(
  mg({
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_API_BASE_URL,
    },
  })
);

// @todo https://www.netlify.com/blog/2021/07/29/how-to-process-multipart-form-data-with-a-netlify-function/?_ga=2.9943221.1450757248.1652745541-1168716722.1652745541

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const params = new URLSearchParams(event.body);
  const mail = {
    from: 'Rooms With Love Website<me@samples.mailgun.org>',
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
