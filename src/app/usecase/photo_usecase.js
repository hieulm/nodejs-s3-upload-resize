const uuid = require('uuid').v1;
const Sharp = require('sharp');
const config = require('config');
const awsRepo = require('../repository/aws_repo');
const COMMON_ERRORS = require('../errors/common_errors');

const ALLOWED_DIMENSIONS = new Set();

const dimensions = config.get('photo.allowed_dimensions').split(/\s*,\s*/);
dimensions.forEach(dimension => ALLOWED_DIMENSIONS.add(dimension));

module.exports.listPhoto = async bucket => {
  try {
    const data = await awsRepo.listS3Objects(bucket);
    return data;
  } catch (error) {
    return error;
  }
};

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

module.exports.uploadAndResize = (readStream, cb) => {
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

  readStream.pipe(resizeWriteStream).pipe(writeStream);

  resizeWriteStream.on('error', err => {
    console.error(err);
    if ((err.message = 'Input buffer contains unsupported image format'))
      cb(COMMON_ERRORS.UNSUPPORTED_IMAGE_FORMAT);
    else cb(COMMON_ERRORS.INTERNAL_SERVER_ERROR);
  });
  writeStream.on('error', err => {
    console.error(err);
    cb(COMMON_ERRORS.INTERNAL_SERVER_ERROR);
  });
  uploaded
    .then(data => {
      cb(null, {
        key: data.key,
        location: data.Location,
      });
    })
    .catch(err => {
      cb(err);
    });
};
