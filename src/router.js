const bodyParser = require('body-parser');
const express = require('express');
const photoHandler = require('./app/handler/photo_handler');

module.exports.create = () => {
  const router = express.Router();

  router.get(
    '/photos',
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    photoHandler.listPhoto
  );
  router.post('/photos', photoHandler.upload);

  return router;
};
