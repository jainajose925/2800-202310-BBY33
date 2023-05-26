require('ejs'); // EJS Configuration
require('./functions'); // Extra Functions to be used
require('dotenv').config(); // Allow .env files to be used
const express = require("express"); // Main part of the NodeJS Server Side
const session = require("express-session"); // Allows session to be used and be manipulated
const app = express(); // Express is used to create the vessel of the main server
const crypto = require('crypto');  // Used for uniquely creating tokens
const {OAUTH_REFRESH_TOKEN, PORT, NODE_SESSION_SECRET, OAUTH_CLIENT_SECRET, OAUTH_CLIENTID, MAIL_USERNAME, HOST_URL} = require("./env"); // Required variables for resetting password
const routes = require('./routes'); // Routes is defined here to allow req.session being modified.

const {mongoStore, url, findUserByEmail, getUserFromToken, setUserToken} = require('./database/db'); // Acquire variables from the database file


const port = PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoute = require('./routes/auth');
const registryRoute = require('./routes/create');
const { resetPassword } = require('./controllers/authController');

const settingRoute = require('./routes/settings');
const journalRoute = require('./routes/gjournal');
const chatRoute = require('./routes/chat');


const nodemailer = require('nodemailer');

app.use(session({
    secret: NODE_SESSION_SECRET,
    store: mongoStore,
    resave: true,
    saveUninitialized: false
}));

const oauth2Client = {
    user: MAIL_USERNAME,
    clientId: OAUTH_CLIENTID,
    clientSecret: OAUTH_CLIENT_SECRET,
    refreshToken: OAUTH_REFRESH_TOKEN
};

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: oauth2Client.user,
        clientId: oauth2Client.clientId,
        clientSecret: oauth2Client.clientSecret,
        refreshToken: oauth2Client.refreshToken
    },
});

routes.use((req, res, next) => {
    req.session = req.session || {};
    next();
});

const publicRoutes = require('./public');
const {resetJournal, loadJournal, isNewDay, getUserEntries, saveJournal} = require("./controllers/journalController");
const {getSavedMessages} = require("./controllers/chatController");

app.use('/', publicRoutes);

app.set('view engine', 'ejs');
app.use('/login', authRoute);

app.use('/signup', registryRoute);
app.use('/gjournal', journalRoute);
app.use('/chatbot', chatRoute);
app.use('/settings', settingRoute);


app.get('/', (req, res) => {

    // console.log((new Date()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    res.redirect('/login');
});

app.get('/forgotpw', (req, res) => {
    res.render("forgotpw");
});

app.get('/dashboard', async (req, res) => {
    if (req.session.authenticated) {

        /* TODO: Load and Reset Journal. */
        let text;
        {
            if (await isNewDay(req))
                text = await resetJournal(req);
            else
                text = await loadJournal(req);
        }
            res.render("main", {username: req.session.username, text: text});
    } else
        res.redirect('/');
});


app.get('/letsplay', (req, res) => {
    console.log(req.session);
    if (req.session.authenticated) {
        res.render("tictactoe");
    } else
        res.redirect('/');
});




async function generateToken(expiration, account) {
    const token = await crypto.randomBytes(20).toString('hex');
    const tokenExpiration = Date.now() + expiration * 1000;
    await setUserToken(account, token, tokenExpiration);
    return token;
}

app.post('/resetpassword/', async (req, res) => {
    const email = req.body.email;
    if (!email) {
        console.log('Email required');
        res.status(400).send('Email required');
    }
    const user = await findUserByEmail(email);
    console.log(user)
    if (user) {
        const token = await generateToken(60 * 60, email);

        console.log(email)
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
                console.log('Email sent: ' + info.response);
                res.redirect('/resetpassword/success');
            }
        });

    } else {
        // user not found
        // Acts like it was successful to prevent email enumeration
        res.redirect('/resetpassword/success');
    }
});

app.post('/sendfeedback/', async (req, res) => {
    const email = req.body.email;
    const subject = req.body.subject;
    const feedback = req.body.message;
    if (!email) {
        console.log('Email required');
        return res.status(400).send('Email required');
    }
    if (!subject) {
        console.log('Subject required');
        return res.status(400).send('Subject required');
    }
    if (!feedback) {
        console.log('Feedback required');
        return res.status(400).send('Message required');
    }

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

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            res.status(500).send('Error while sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.redirect('/');
        }
    })

})

app.get('/pwreset/:token', async (req, res) => {
    const token = req.params.token;
    const user = await getUserFromToken(token);
    if (user) {
        if (Date.now() > user.tokenExpiration) {
            // token expired
            res.redirect('/resetpassword/expired');
        } else {
            // token is valid
            res.render('reset_password', {token: token});
        }
    }
});

app.post('/mt', (req, res) => {
    const {ch1, ch2, ch3, ch4, ch5} = req.body;
    req.session.moods = [ch1, ch2, ch3, ch4, ch5].filter((selectedMood) => selectedMood != null);
    console.log(`${req.session.moods}`);
    res.redirect('/chatbot');
})
app.post('/updateuser/', async (req, res) => {
    const token = req.body.token;
    const password = req.body.password;
    const user = await getUserFromToken(token);
    if (user) {
        if (Date.now() > user.tokenExpiration) {
            // token expired
            res.redirect('/resetpassword/complete/expired');
        } else {
            // token is valid

            await resetPassword(user.email, password);
            res.redirect('/resetpassword/complete/success');
        }
    }
});

app.get('/resetpassword/success', (req, res) => {
    res.render('emaillSuccess');
});

app.get('/resetpassword/complete/success', (req, res) => {
    res.render('resetpwsuccess');
});

app.get('/resetpassword/complete/expired', (req, res) => {
    res.render('resetpwexpired');
});

app.post('/signout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/*', (req,res) => {
    res.render('404');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`connectionURL: ${url}`);
});

