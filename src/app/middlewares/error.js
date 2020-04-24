const httpStatus = require('http-status');
const expressValidation = require('express-validation');
const config = require('config');
const APIError = require('../../utils/APIError');
const logger = require('../../core/logger.core');

const env = config.get('env');

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
// eslint-disable-next-line no-unused-vars
const handler = (err, req, res, next) => {
  const response = {
    code: err.code || err.status,
    message: err.message || httpStatus[err.status],
    errors: err.errors,
    stack: err.stack,
  };

  logger.error(err);

  if (env !== 'development') {
    delete response.stack;
  }

  res.status(err.status);
  res.json(response);
};
exports.handler = handler;

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */
// eslint-disable-next-line no-unused-vars
exports.converter = (err, req, res, next) => {
  let convertedError = err;

  if (err instanceof expressValidation.ValidationError) {
    convertedError = new APIError({
      message: 'Validation Error',
      errors: err.errors,
      status: httpStatus.UNPROCESSABLE_ENTITY,
      stack: err.stack,
    });
  } else if (!(err instanceof APIError)) {
    if (env !== 'production')
      convertedError = new APIError({
        message: err.message,
        status: err.status,
        stack: err.stack,
      });
    else {
      convertedError = new APIError({
        message: 'internal server error',
        status: 500,
      });
    }
  }

  return handler(convertedError, req, res);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
// eslint-disable-next-line no-unused-vars
exports.notFound = (req, res, next) => {
  const err = new APIError({
    message: 'Not found',
    status: httpStatus.NOT_FOUND,
  });
  return handler(err, req, res);
};
