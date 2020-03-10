const config = require('config');
const photoUcase = require('../usecase/photo_usecase');
const COMMON_ERRORS = require('../errors/common_errors');

module.exports.upload = (req, res, next) => {
  const { headers } = req;
  const contentType = headers['content-type'];
  if (contentType.split('/')[0] != 'image') {
    return res.status(422).json({
      errors: [{ code: 422, message: 'unsupported image format' }],
    });
  }
  photoUcase.uploadAndResize(req, (err, data) => {
    if (err) next(err);
    else {
      res.status(200).json(data);
    }
  });
};

module.exports.listPhoto = async (req, res, next) => {
  try {
    const data = await photoUcase.listPhoto(config.get('aws.bucket'));

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports.getPhoto = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { size } = req.query;

    if (size)
      if (!/^\d+[xX]\d+$/.test(size)) {
        throw COMMON_ERRORS.INVALID_PHOTO_DIMENSION;
      }

    const objectUrl = await photoUcase.getPhotoURL(
      {
        bucket: config.get('aws.bucket'),
        key,
      },
      { size }
    );

    res.redirect(301, objectUrl);
    // const readStream = await photoUcase.downloadPhoto(
    //   {
    //     bucket: config.get('aws.bucket'),
    //     key,
    //   },
    //   { size }
    // );

    // readStream
    //   .pipe(res)
    //   .on('data', data => {
    //     console.log('data received');
    //   })
    //   .on('error', err => {
    //     console.error(err);
    //     // next(COMMON_ERRORS.INTERNAL_SERVER_ERROR);
    //   })
    //   .on('close', () => {
    //     console.info('done');
    //   });
  } catch (error) {
    next(error);
    console.error(error);
  }
};
