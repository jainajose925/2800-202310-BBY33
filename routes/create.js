const express = require('express');
const router = express.Router();
const {registerUser} = require('../controllers/authController');

router.post('/', registerUser);
router.get('/', async (req, res) => {
    if (req.session.authenticated)
        res.redirect('/dashboard');
    else
        res.render('signup');
})

module.exports = router;