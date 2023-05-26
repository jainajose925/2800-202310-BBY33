const express = require('express');
const {findUserByEmail} = require("../database/db");
const {HOST_URL} = require("../env");
const {generateToken, transporter} = require("../controllers/authController");
const router = express.Router();


router.get('/:log', (req, res) => {
    if (req.params.log == "success")
        res.render("emaillSuccess");
})


router.post('/', async (req, res) => {
    const email = req.body.email;
    if (!email) {
        res.status(400).send('Email required');
    }
    const user = await findUserByEmail(email);
    if (user) {
        const token = await generateToken(60 * 60, email);
        let mailOptions = {
            from: 'groundd.app@gmail.com',
            to: `${email}`,
            subject: 'Password Reset Request',
            html: `
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:</p>
        <a href="${HOST_URL}/pwreset/${token}">${HOST_URL}/pwreset/${token}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `
        };

            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                res.status(500).send('Error while sending email');
            } else {
                res.redirect('/resetpassword/success');
            }
        });

    } else {
        // user not found
        // Acts like it was successful to prevent email enumeration
        res.redirect('/resetpassword/success');
    }
});

router.get('/:status/:log', (req, res) => {
    if (req.params.status == "complete")
        switch (req.params.log) {
            case "success":
                res.render('resetpwsuccess');
                return;
            case "expired":
                res.render('resetpwexpired');
                return;
        }
})
// router.get('/:/success', (req, res) => {
//     res.render('emaillSuccess');
// });
//
// router.get('/:/complete/success', (req, res) => {
//     res.render('resetpwsuccess');
// });
//
// router.get('/:/complete/expired', (req, res) => {
//     res.render('resetpwexpired');
// });

module.exports = router;