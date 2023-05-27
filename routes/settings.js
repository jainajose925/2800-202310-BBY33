const express = require('express');
const {isAdmin, transporter} = require("../controllers/authController");
const {getListOfUsers} = require("../database/db");
const router = express.Router();
router.get('/', async(req, res) => {
    console.log(req.session);
    if (req.session.authenticated) {
        res.render("settings", {isAdmin: await isAdmin(req)});
    } else
        res.redirect('/');
});

/*
    Called when submitting the feedback form found in Help page inside the settings module.
 */
router.post('/:module', async (req, res) => {
    if (req.params.module != "sendfeedback")
        return;
    const email = req.body.email;
    const subject = req.body.subject;
    const feedback = req.body.message;
    switch (true) {
        case (!email):
            return res.status(400).send('Email required');
        case (!subject):
            return res.status(400).send('Subject required');
        case (!feedback):
            return res.status(400).send('Message required');
    }

    // Create Template Message
    let mailOptions = {
        from: `${email}`,
        to: '	groundd.app@gmail.com',
        subject: `User Feedback: ${subject}`,
        html: `
        <div>
        <h2>Feedback from ${email}</h2>
        <h2>Subject: ${subject}</h2>
        <p>Do not click on any links in this email, as they may be malicious.</p>
        </div>
        ----------------------------------------
        <p>${feedback}</p>`
    }

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            res.status(500).send('Error while sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.redirect('/');
        }
    })

})

/*
    Renders the settings page.
 */
router.get('/:type',  async (req, res) => {
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
            res.render("admin", {__users: await getListOfUsers()});
    }

});
module.exports = router;