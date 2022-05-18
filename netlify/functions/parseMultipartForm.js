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

    // if (event.isBase64Encoded) {
    //   const buffer = Buffer.from(event.body, 'base64');
    //   busboy.end(buffer.toString());
    // } else {
    //   busboy.end(event.body);
    // }
  });
}

module.exports = parseMultipartForm;
