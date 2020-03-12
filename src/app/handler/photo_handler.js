const config = require('config');
const photoUcase = require('../usecase/photo_usecase');
const COMMON_ERRORS = require('../errors/common_errors');

module.exports.upload = async (req, res, next) => {
  try {
    const { headers } = req;
    const contentType = headers['content-type'];
    if (contentType.split('/')[0] != 'image') {
      return res.status(415).json({
        errors: [
          {
            code: 415,
            message:
              'unsupported image format, supported file types: png, jpg, jpeg',
          },
        ],
      });
    }

    const result = await photoUcase.uploadAndResize(req);
    res.status(201).json(result);
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

    res.redirect(302, objectUrl);
  } catch (error) {
    next(error);
  }
};
