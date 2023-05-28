// Desc: This file is the main router for the application. It will route all requests to the correct router.
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const dataRoutes = require('./data');

router.use(authRoutes);
router.use(dataRoutes);

module.exports = router;
