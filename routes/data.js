const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { setUserDataController, getUserDataController } = require('../controllers/dataController');

router.post('/set-data', authMiddleware, setUserDataController);
router.get('/get-data', authMiddleware, getUserDataController);

module.exports = router;
