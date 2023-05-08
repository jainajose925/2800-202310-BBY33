
require('ejs');
// require('./functions');
require('dotenv').config();
const express= require("express");
const session = require("express-session")
const app = express();

const bcrypt = require('bcrypt');
const saltRounds = 10;
const port = process.env.PORT || 3000;
const joi = require('joi');
const jwt = require('jsonwebtoken');
// const routes = require('./routes');

const logOutWhen = 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)

const node_session_secret = process.env.NODE_SESSION_SECRET;

// app.use(session({
//     secret: process.env.NODE_SESSION_SECRET,
//     store: mongoStore,
//     resave: true,
//     saveUninitialized: false,
//     cookie: {
//         secure: false, // only set this if using HTTPS
//         sameSite: 'none'
//     }
// }));


app.use(session({
    secret: node_session_secret,
    saveUninitialized: false,
    resave: true
}));

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/img", express.static("./public/img"));

app.set('view engine', 'ejs');

app.use('/', routes);

app.get('/', (req, res) => {
    // res.render("landing");
})

app.get('/signUp', (req, res) => {
    // res.render("signup");
})

app.get('/jjournal', (req, res) => {
    // if (req.session.authenticated) {
    //     res.render('journal', {journalContent: req.session.data.jjournal[0]
    //     });
    // } else {
    //     res.redirect('/');
    // }
})

app.get('/mood', (req, res) => {
    // if (req.session.authenticated) {
    // res.render('moodTracker')
    // } else {
    //     res.redirect('/');
    // }
})
app.get('/main', (req, res) => {
    // res.render("main");
});

/*

app.get('/main', (req, res) => {
    if (req.session.authenticated) {
        res.render('main', {username: req.session.username});
    }
    else {
        res.redirect('/');
    }
})
*/

// app.post('/logMood', async (req, res) => {
//     req.session.data.mood[0] = req.body.mood;
//     await setUserData(req.session.token, {mood: req.session.data.mood});
// })
// app.post('/saveJournal', async (req, res) => {
//     req.session.data.jjournal[0] = req.body.journalTextBox;
//     await setUserData(req.session.token, {jjournal: req.session.data.jjournal});
//     res.redirect('/jjournal');
// })
app.post('/register', async (req, res) => {
    try {
        await createUser(req.body.emailAddress, req.body.nickname, req.body.key);
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {

        const token = await authenticateUser(req.body.__loginEmailAddress, req.body.__loginKey);
        if (token) {
            const data = await getUserData(token);
            req.session.authenticated = true;
            req.session.username = data.username;
            req.session.data = data;
            req.session.cookie.maxAge = logOutWhen;
            req.session.token = token;
            res.redirect('/main');
            return;
        }
        res.redirect('/');
    } catch (error) {
        res.status(401).send({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

