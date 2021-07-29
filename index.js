const http = require('http');
const express = require('express');
const { createTerminus } = require('@godaddy/terminus');

(async () => {
  const app = express();
  app.enable('trust proxy');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const server = http.createServer(app);

  app.get('/api/test', (req, res) => {
    console.log(req.body, req.params, req.query);
    return res.json({
        message: "Hello world from version 2"
    });
  });

  app.get('/api/test/test', (req, res) => {
    console.log(req.body, req.params, req.query);
    return res.json({
        message: "Hello world from nested version 2"
    });
  });

  app.post('/api/test/test', (req, res) => {
    console.log(req.body, req.params, req.query);
    return res.json({
        message: "Hello world from post nested version 2"
    });
  });

  app.get('/', (req, res) => {
    console.log(req.body, req.params, req.query);
    return res.json({
        message: "Hello world from " + process.env.HOSTNAME
    });
  });

  app.get('/api/docs', (req, res) => {
    return res.json({
        message: "Secure docs endpoint"
    })
  });

  const onSignal = () => Promise.resolve();
  const onShutdown = async () => {
    console.log('cleanup finished, server is shutting down');
  };
  const onHealthCheck = async ({ state }) => {
    if (state.isShuttingDown) {
      throw new Error('Server is shutting down...');
    }

    return {
      serverStatus: !state.isShuttingDown,
    };
  };

  const beforeShutdown = () =>
    new Promise((resolve) => {
        // https://github.com/godaddy/terminus#how-to-set-terminus-up-with-kubernetes
        setTimeout(resolve, 5000);
    });

  createTerminus(server, {
    logger: console.info,
    // SIGUSR2 is sent by nodemon
    signals: ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGUSR2'],
    healthChecks: {
        '/_health': onHealthCheck,
    },
    onSignal,
    onShutdown,
    // NOTE: Max api timeout, any requests that execute more than this will be kill
    timeout: 5000,
    beforeShutdown,
  });

  server.listen(3000, () => {
    console.log(`Environment: test`);
    console.log(`Server listening on port: 3000`);
  });
})();
