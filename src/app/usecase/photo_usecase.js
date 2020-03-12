const uuid = require('generate-safe-id');
const Sharp = require('sharp');
const config = require('config');
const awsRepo = require('../repository/aws_repo');
const COMMON_ERRORS = require('../errors/common_errors');

const ALLOWED_DIMENSIONS = new Set();

const dimensions = config.get('photo.allowed_dimensions').split(/\s*,\s*/);
dimensions.forEach(dimension => ALLOWED_DIMENSIONS.add(dimension));

module.exports.getPhotoURL = ({ bucket, key }, params) => {
  return new Promise((resolve, reject) => {
    const { size } = params;
    if (!size) resolve(awsRepo.getObjectUrl({ Bucket: bucket, Key: key }));
    else {
      if (!ALLOWED_DIMENSIONS.has(size))
        resolve(awsRepo.getObjectUrl({ Bucket: bucket, Key: key }));

      const readStream = awsRepo.readStream({ Bucket: bucket, Key: key });

      readStream.on('error', err => {
        console.error(err);
        reject(COMMON_ERRORS.INTERNAL_SERVER_ERROR);
      });
      const width = parseInt(size.split('x')[0]);
      const height = parseInt(size.split('x')[1]);
      const resizeStream = Sharp().resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });

      resizeStream
        .on('error', err => {
          console.error(err);
          reject(COMMON_ERRORS.INTERNAL_SERVER_ERROR);
        })
        .toFormat('png');

      const { writeStream, uploaded } = awsRepo.writeStream(
        {
          Bucket: bucket,
          Key: `${size}/${key}`,
        },
        {
          ACL: 'public-read',
        }
      );

      writeStream.on('error', err => {
        console.error(err);
        reject(err);
      });

      readStream
        .pipe(resizeStream)
        .pipe(writeStream)
        .on('done', () => {
          console.log('done');
        });

      uploaded
        .then(async data => {
          const objectUrl = await awsRepo.getObjectUrl({
            Bucket: bucket,
            Key: `${size}/${key}`,
          });

          resolve(objectUrl);
        })
        .catch(err => {
          reject(err);
        });
    }
  });
};

module.exports.uploadAndResize = async readStream => {
  try {
    const Emitter = require('events');
    const errorEmitter = new Emitter();

    errorEmitter.on('error', err => {
      throw err;
    });

    const id = uuid();
    const resizeWriteStream = Sharp()
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat('png');

    const { writeStream, uploaded } = awsRepo.writeStream(
      {
        Bucket: config.get('aws.bucket'),
        Key: `${id}.png`,
      },
      {
        ACL: 'public-read',
      }
    );

    const end = new Promise(async (resolve, reject) => {
      try {
        resizeWriteStream.on('error', err => {
          console.error(err);
          writeStream.destroy();
          if ((err.message = 'Input buffer contains unsupported image format'))
            reject(COMMON_ERRORS.UNSUPPORTED_IMAGE_FORMAT);
          else reject(COMMON_ERRORS.INTERNAL_SERVER_ERROR);
        });
        writeStream.on('error', async err => {
          reject(COMMON_ERRORS.INTERNAL_SERVER_ERROR);
        });
        readStream
          .pipe(resizeWriteStream)
          .pipe(writeStream)
          .on('error', err => {
            reject(COMMON_ERRORS.INTERNAL_SERVER_ERROR);
          });
        const resp = await uploaded;
        resolve({
          key: resp.key,
          location: `${config.get('photo.root_url')}/${resp.key}`,
        });
      } catch (error) {
        reject(error);
      }
    });

    const result = await end;
    return result;
  } catch (error) {
    throw error;
  }
};
