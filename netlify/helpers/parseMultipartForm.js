const Busboy = require('busboy');
const { Transform } = require('node:stream');

function parseMultipartForm(event, options = {}) {
  return new Promise((resolve) => {
    const fields = {
      attachments: []
    };
    const busboy = Busboy({
      headers: event.headers
    });

    busboy.on('file', async (_fieldName, fileStream, info) => {
        // The stream has to be read to completion
        // or else Busboy will hang while processing
        // the form contents. We want to hold on to the streams
        // so that we can stream the uploads over email,
        // we we create a Transform stream to receive the
        // original stream contents from Busboy.

        const { filename, encoding } = info;
        const passthrough = new Transform({
          transform(chunk, _, cb) {
            cb(null, chunk)
          }
        });

        fileStream.pipe(passthrough);

        fields.attachments.push({
          filename,
          content: passthrough,
          encoding
        });
      }
    );

    busboy.on('field', (fieldName, value) => {
      fields[fieldName] = value;
    });

    busboy.on('close', () => resolve(fields));
    busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    busboy.end();
  });
}

module.exports = parseMultipartForm;
