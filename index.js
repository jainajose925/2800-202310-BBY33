require('ejs');
require('./functions');
require('dotenv').config();
// const env = require('./env.js');
const express = require("express");
const session = require("express-session")
const app = express();

const routes = require('./routes');

const {mongoStore, url, getUserData, findUserByEmail, updateUserData} = require('./database/db');
console.log(__dirname);

const port = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoute = require('./routes/auth');
const registryRoute = require('./routes/create');

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
const {ObjectId} = require("mongodb");
app.use('/', publicRoutes);

app.set('view engine', 'ejs');
app.use('/login', authRoute);

app.use('/signup', registryRoute);

app.get('/', (req, res) => {
    res.redirect('/login');
})

app.get('/dashboard', async (req, res) => {
    console.log(req.session);
    /* Function Placement */

    if (req.session.authenticated) {
        const __user = await findUserByEmail(req.session.email);
        let data;
        if (__user.data != null) {
            data = __user.data;
        } else {
            data = [[req.session.logDate], [""], []];
        }
        data[0][0] = req.session.logDate;
        if (await isNewDay(req, res)) {
            await updateUserData(new ObjectId(__user._id), data);
            res.render("main", {username: req.session.username, text: ""});
        } else {

            const __entries = data[1];
            const len = __entries.length;

            await updateUserData(__user._id, data);
            res.render("main", {username: req.session.username, text: __entries[len - 1]});
        }
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


async function isNewDay(req, res) {
    const __user = await findUserByEmail(req.session.email);
    const data = __user.data;
    if (data == null)
        return true;
    else
        return data[0][0] !== req.session.logDate;
}