// PlaceHolder for main merge issue.
require('ejs');
require('./functions');
require('dotenv').config();
// const env = require('./env.js');
const express = require("express");
const session = require("express-session")
const app = express();
const crypto = require('crypto');

const routes = require('./routes');




const {mongoStore, url, getUserData, findUserByEmail, updateUserData, getUserFromToken, setUserToken} = require('./database/db');

console.log(__dirname);

const port = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoute = require('./routes/auth');
const registryRoute = require('./routes/create');
const { resetPassword } = require('./controllers/authController');

const journalRoute = require('./routes/gjournal');


const nodemailer = require('nodemailer');
const env = require('./env.js');


app.use(session({
    secret: process.env.NODE_SESSION_SECRET,
    store: mongoStore,
    resave: true,
    saveUninitialized: false,
    // cookie: {
    //     secure: false, // only set this if using HTTPS
    //     sameSite: 'none'
    // }
}));

const oauth2Client = {
    user: process.env.MAIL_USERNAME,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN
};
console.log(oauth2Client);

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
app.use('/', publicRoutes);

app.set('view engine', 'ejs');
app.use('/login', authRoute);

app.use('/signup', registryRoute);
app.use('/gjournal', journalRoute);

app.get('/', (req, res) => {
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

app.get('/settings', (req, res) => {
    console.log(req.session);
    if (req.session.authenticated) {
        res.render("settings");
    } else
        res.redirect('/');
});


app.get('/account', (req, res) => {
    console.log(req.session);
    if (req.session.authenticated) {
        res.render("account", {req: req});
    } else
        res.redirect('/');
});

app.get('/gjournal', async (req, res) => {
    console.log(req.session);
    if (req.session.authenticated) {
        res.render("journal", {req: req, entries: await getUserEntries(req)});
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
        <a href="${env.HOST_URL}/pwreset/${token}">${env.HOST_URL}/pwreset/${token}</a>
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



app.post('/signout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/chatbot', (req, res) => {
    console.log(req.session);
    if (req.session.authenticated) {
        res.render("chatbot");
    } else
        res.redirect('/');
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`connectionURL: ${url}`);
});

