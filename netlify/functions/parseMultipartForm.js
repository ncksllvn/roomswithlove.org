const Busboy = require('busboy');

function parseMultipartForm(event) {
  return new Promise((resolve) => {
    const fields = {
      attachments: []
    };
    const busboy = Busboy({
      headers: event.headers
    });

    busboy.on('file', (fieldName, fileStream, info) => {
        const { filename, encoding, mimeType } = info;

        fileStream.on('data', (data) => {
          fields.attachments.push({
            filename,
            mimeType,
            content: data,
            encoding
          });
        });
      }
    );

    busboy.on('field', (fieldName, value) => {
      fields[fieldName] = value;
    });

    busboy.on('finish', () => resolve(fields));
    busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    busboy.end();
  });
}

module.exports = parseMultipartForm;
