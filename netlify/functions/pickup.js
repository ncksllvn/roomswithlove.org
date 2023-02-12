const mailer = require('../helpers/mailer');
const Sentry = require('../helpers/sentry');
const parsePickupForm = require('../helpers/parsePickupForm');

const {
  MAILGUN_DOMAIN: mailgunDomain,
  EMAIL_RECIPIENTS: emailRecipients,
  EMAIL_BCC: emailBcc
} = process.env;

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

  const scope = new Sentry.Scope();
  const fields = await parsePickupForm(event);

  scope.setUser({ email: fields.email });

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
    text: messageBody,
    attachments: fields.attachments
  };

  let info;

  try {
    info = await mailer.sendMail(mail);
  } catch (error) {
    Sentry.captureException(error, scope);
    return {
      statusCode: 500,
      body: 'An unknown error occurred'
    };
  }

  return {
    statusCode: 200,
    body: info.message
  };
};
