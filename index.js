require('ejs');
require('./functions');
require('dotenv').config();
// const env = require('./env.js');
const express = require("express");
const session = require("express-session")
const app = express();

const routes = require('./routes');

const {mongoStore, url} = require('./database/db');
console.log(__dirname);

const port = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoute = require('./routes/auth');
const registryRoute = require('./routes/create');
const journalRoute = require('./routes/gjournal');
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
})

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

