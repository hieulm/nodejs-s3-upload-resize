const APIError = require('../../utils/APIError');

module.exports = {
  UNAUTHORIZED: new APIError({
    isPublic: true,
    code: 401,
    status: 401,
    message: 'unauthorized',
    errors: [
      {
        code: 401,
        message: 'unauthorized',
      },
    ],
  }),
  INTERNAL_SERVER_ERROR: new APIError({
    isPublic: true,
    code: 500,
    status: 500,
    message: 'internal server error',
    errors: [
      {
        code: 500,
        message: 'internal server error',
      },
    ],
  }),
  UNSUPPORTED_IMAGE_FORMAT: new APIError({
    isPublic: true,
    code: 422,
    status: 422,
    message: 'unsupported image format',
    errors: [
      {
        code: 422,
        message: 'unsupported image format',
      },
    ],
  }),
  NOT_FOUND: new APIError({
    isPublic: true,
    code: 404,
    status: 404,
    message: 'not found',
    errors: [
      {
        code: 404,
        message: 'not found',
      },
    ],
  }),
  INVALID_PHOTO_DIMENSION: new APIError({
    isPublic: true,
    code: 400,
    status: 400,
    message: 'invalid photo dimension',
    errors: [
      {
        code: 400,
        message: 'invalid photo dimension',
      },
    ],
  }),
};
