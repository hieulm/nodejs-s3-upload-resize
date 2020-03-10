const uuid = require('uuid').v1;
const Sharp = require('sharp');
const config = require('config');
const awsRepo = require('../repository/aws_repo');
const COMMON_ERRORS = require('../errors/common_errors');

module.exports.listPhoto = async bucket => {
  try {
    const data = await awsRepo.listS3Objects(bucket);
    return data;
  } catch (error) {
    return error;
  }
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
