const http = require('http');
const config = require('config');
const { createTerminus } = require('@godaddy/terminus');
const logger = require('./core/logger.core');
const routes = require('./router').create();
const app = require('./core/express.core').create(routes);

const onSignal = () => {
  logger.info('server is starting cleanup');
  return Promise.all([]);
};

const onShutdown = () => {
  logger.info('cleanup finished, server is shutting down');
};

const healthCheck = () => Promise.resolve();

const startAPIServer = () =>
  new Promise((resolve, reject) => {
    const server = http.createServer(app);
    createTerminus(server, {
      healthChecks: {
        '/health': healthCheck,
        verbatim: true,
      },
      timeout: 1000,
      onSignal,
      onShutdown,
      logger,
    });
    server.listen(config.get('port'), (err, ok) => {
      if (err) return reject(err);
      return resolve(ok);
    });
  });

const start = async () => {
  try {

    await startAPIServer();
    logger.info(`[MAIN] Server is listening on port ${config.get('port')}`);
  } catch (error) {
    logger.error(error);
    process.kill(process.pid, 'SIGTERM');
  }
};

start();

const shutdown = signal => async err => {
  try {
    logger.info(`${signal} signal received.`);
    if (err) logger.error(err.stack || err);

    // if (rabbit.connection()) await rabbit.close();
    process.exit(0);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown('SIGNTERM'));
