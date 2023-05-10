const express = require('express');
const router = express.Router();
const { loginUser, registerUser, createRefreshToken} = require('../controllers/authController');

router.post('/', loginUser);

router.get('/', async (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/dashboard');
    } else
        res.render("landing");
})


module.exports = router;
