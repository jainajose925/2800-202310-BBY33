// PlaceHolder for main merge issue.
const express = require('express');
const router = express.Router();
const { loginUser, registerUser, createRefreshToken} = require('../controllers/authController');

router.post('/', loginUser);

router.get('/:error', (req, res) => {
    let error = "";
    switch (req.params.error) {
        case "wrongPassword":
            error = "Incorrect Password!";
            break;
        case "userNotFound":
            error = "Invalid Email!";
            break;
        case "passwordNotMatched":
            error = "Sign Up Error: Passwords Do Not Match!";
            break;
        case "emailIsTaken":
            error = "Sign Up Error: Email is Taken!";
            break;
        default:
            error = "Sign Up Error: " + req.params.error
            break;
    }
    res.render("landing", {error: error});
})

router.get('/', async (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/dashboard');
    } else
        res.render("landing", {error: ""});
})


module.exports = router;
