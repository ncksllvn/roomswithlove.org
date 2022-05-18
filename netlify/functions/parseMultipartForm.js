const Busboy = require('busboy');

function parseMultipartForm(event) {
  return new Promise((resolve) => {
    const fields = {};
    const busboy = Busboy({
      headers: event.headers
    });

    busboy.on('file',
      (fieldName, fileStream, info) => {
        const { filename, encoding, mimeType } = info;

        fields[fieldName] = {
          filename,
          mimeType,
          content: null,
          encoding
        };

        fileStream.on('data', (data) => {
          fields[fieldName].content = data;
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
