const mailgun = require("mailgun-js");

const {
  MAILGUN_API_KEY: apiKey,
  MAILGUN_API_BASE_URL: domain
} = process.env;

const mg = mailgun({
  apiKey, domain
});

const data = {
	from: 'Example<me@samples.mailgun.org>',
	to: 'ncksllvn@gmail.com',
	subject: 'Hello',
	text: 'Testing some Mailgun awesomness!'
};

exports.handler = async (event, context) => {
  try {
    await mg.messages().send(data);
  } catch(error) {
    return {
      statusCode: 500,
      body: error.message
    };
  }

  return {
    statusCode: 200,
    body: "Pickup scheduled"
  };
};
