const express = require('express');
const router = express.Router();
const tester = require('../controllers/testery');

const authRoutes = require('./auth');
const dataRoutes = require('./data');
const testRoutes = require('./test');
router.use(authRoutes);
router.use(dataRoutes);
router.use(testRoutes);


// router.get('/dashboard', (req, res) => {
//     console.log(req.headers.authorization);
// });

module.exports = router;
