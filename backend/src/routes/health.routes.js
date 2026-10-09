const express = require('express');
const router = express.Router();
const { getAppHealth, getDbHealth } = require('../controllers/health.controller');

// Slice 1: Web server health
router.get('/', getAppHealth);

// Slice 2: Database connection pool health
router.get('/db', getDbHealth);

module.exports = router;
