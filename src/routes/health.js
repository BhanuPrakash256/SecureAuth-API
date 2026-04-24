const express = require('express');
const mongoose = require('mongoose');
const { version } = require('../../package.json');

const router = express.Router();

router.get('/', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const status = dbConnected ? 200 : 503;

  res.status(status).json({
    status: dbConnected ? 'ok' : 'degraded',
    version,
    uptime: Math.floor(process.uptime()),
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

module.exports = router;
