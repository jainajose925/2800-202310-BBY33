const express = require('express');
const {isAdmin} = require("../controllers/authController");
const router = express.Router();
router.get('/', async(req, res) => {
    console.log(req.session);
    if (req.session.authenticated) {
        res.render("settings", {isAdmin: await isAdmin(req)});
    } else
        res.redirect('/');
});


router.get('/:type',  (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }

    switch (req.params.type) {
        case "account":
            res.render("account", {req: req});
            return;
        case "about":
            res.render("about");
            return;
        case "help":
            res.render("help");
            return;
        case "members":
            res.render("admin");
    }
    // console.log(req.session);
    // if (req.session.authenticated) {
    //     res.render("account", {req: req});
    // } else
    //     res.redirect('/');
});
module.exports = router;