const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserData, setUserData } = require('../controllers/dataController');

router.post('/set-data', authMiddleware, setUserData);
router.get('/get-data', authMiddleware, getUserData);

module.exports = router;
