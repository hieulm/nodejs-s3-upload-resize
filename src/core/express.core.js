const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rid = require('connect-rid');
const responseTime = require('response-time');
const error = require('../app/middlewares/error');

module.exports.create = routes => {
  const app = express();

  // parse body params and attache them to req.body

  app.use(helmet());
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
    })
  );
  app.use(
    rid({
      headerName: 'X-REQUEST-ID',
    })
  );
  app.use(responseTime());

  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms')
  );

  app.use(routes);

  app.use(error.converter);

  app.use(error.notFound);

  app.use(error.handler);

  return app;
};
