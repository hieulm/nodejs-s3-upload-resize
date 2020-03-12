const bodyParser = require('body-parser');
const express = require('express');
const photoHandler = require('./app/handler/photo_handler');

module.exports.create = () => {
  const router = express.Router();

  router.post('/photos', photoHandler.upload);

  router.get('/photos/:key', photoHandler.getPhoto);

  return router;
};
