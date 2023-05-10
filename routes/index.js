const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const dataRoutes = require('./data');

router.use(authRoutes);
router.use(dataRoutes);

module.exports = router;
