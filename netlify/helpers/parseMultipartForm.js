const Busboy = require('busboy');
const FileType = require('stream-file-type');

function parseMultipartForm(event, options = {}) {
  return new Promise((resolve) => {
    const fields = {
      attachments: []
    };
    const busboy = Busboy({
      headers: event.headers
    });

    busboy.on('file', async (_fieldName, fileStream, info) => {
        const { filename, encoding, mimeType } = info;

        const detector = new FileType();
        const getFileType = detector.fileTypePromise();

        fileStream.pipe(detector);

        const fileType = await getFileType;

        if (!fileType) {
          console.warn('Failed to determine mime type');
          return;
        }

        if (options.mimeTypes && !options.mimeTypes(fileType.mime)) {
          console.warn('Invalid mime type');
          return;
        }

        fields.attachments.push({
          filename,
          mimeType,
          content: detector,
          encoding
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
