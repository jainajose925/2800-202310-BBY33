require('ejs');
require('./functions');
const env = require('./env.js');
const express = require("express");
const session = require("express-session")
const app = express();

const routes = require('./routes');

const {mongoStore, url} = require('./database/db');
console.log(__dirname);

const port = env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoute = require('./routes/auth');
const registryRoute = require('./routes/create');

app.use(session({
    secret: env.NODE_SESSION_SECRET,
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
app.use('/', publicRoutes);

app.set('view engine', 'ejs');
app.use('/login', authRoute);

app.use('/signup', registryRoute);

app.get('/', (req, res) => {
    res.redirect('/login');
})

app.get('/dashboard', (req, res) => {
    console.log(req.session);
    if (req.session.authenticated) {
        res.render("main", {username: req.session.username});
    } else
        res.redirect('/');
});

app.post('/signout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`connectionURL: ${url}`);
});


