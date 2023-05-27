/*
    This file is used to handle the routes for the create page.
 */
const express = require('express');
const router = express.Router();
const {registerUser} = require('../controllers/authController');

/*
    Called when the user submits the registration form.
 */
router.post('/', registerUser);

/*
    Called when the user visits the create page.
 */
router.get('/', async (req, res) => {
    if (req.session.authenticated)
        res.redirect('/dashboard');
    else
        res.redirect('/');
})

module.exports = router;
