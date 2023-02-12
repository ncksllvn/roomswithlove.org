const mailer = require('../helpers/mailer');
const Sentry = require('../helpers/sentry');
const parseMultipartForm = require('../helpers/parseMultipartForm');

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

  const fields = await parseMultipartForm(event, {
    mimeTypes: mime => mime.startsWith('image/')
  });

  const scope = new Sentry.Scope();
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
    text: messageBody
  };

  if (fields.attachments.length > 0) {
    // const getImagesOnly = fields.attachments.map(async attachment => {
    //     const { content, getFileType } = attachment;
    //     const fileType = await getFileType;

    //     if (fileType.mime.startsWith('image/')) {
    //       return { content };
    //     }

    //     return null;
    //   });

    // let images = await Promise.all(getImagesOnly);
    // images = images.filter(image => image);

    mail.attachments = fields.attachments;

    mail.attachments.forEach(a => {
      a.content.resume();
      a.content.on('close', () => 'closing...')
    })
  }

  let info;

  try {
    console.log('Sending mail...')
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
