const config = require('config');
const photo_ucase = require('../usecase/photo_usecase');

module.exports.upload = (req, res, next) => {
  const { headers } = req;
  const contentType = headers['content-type'];
  if (contentType.split('/')[0] != 'image') {
    return res.status(422).json({
      errors: [{ code: 422, message: 'unsupported image format' }],
    });
  }
  photo_ucase.uploadAndResize(req, (err, data) => {
    if (err) next(err);
    else {
      res.status(200).json(data);
    }
  });
};

module.exports.listPhoto = async (req, res, next) => {
  try {
    const data = await photo_ucase.listPhoto(config.get('aws.bucket'));

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
