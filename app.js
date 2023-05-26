require('ejs'); // EJS Configuration
require('./functions'); // Extra Functions to be used
require('dotenv').config(); // Allow .env files to be used
const express = require("express"); // Main part of the NodeJS Server Side
const session = require("express-session"); // Allows session to be used and be manipulated
const app = express(); // Express is used to create the vessel of the main server
const { PORT, NODE_SESSION_SECRET} = require("./env"); // Required variables for resetting password
const routes = require('./routes'); // Routes is defined here to allow req.session being modified.

const {mongoStore,  getUserFromToken} = require('./database/db'); // Acquire variables from the database file

const port = PORT || 8080; // The port address where the website will be used


app.use(express.json()); // Allow json parsing
app.use(express.urlencoded({ extended: true })); // Allow body parsing

const authRoute = require('./routes/auth'); // Authentication route
const registryRoute = require('./routes/create'); // Registration route
const { resetPassword } = require('./controllers/authController'); // Used for changing password

const settingRoute = require('./routes/settings'); // Settings route
const journalRoute = require('./routes/gjournal'); // Gratitude Journal route
const chatRoute = require('./routes/chat'); // Chat Bot route
const resetPasswordRoute = require('./routes/resetpassword'); // Reset Password route


/*
    Allow session storage
 */
app.use(session({
    secret: NODE_SESSION_SECRET,
    store: mongoStore,
    resave: true,
    saveUninitialized: false
}));



/*
    Allow all routes to use the same session.
 */
routes.use((req, res, next) => {
    req.session = req.session || {};
    next();
});

const publicRoutes = require('./public'); // Contains the static loaders of the public directory
const {resetJournal, loadJournal, isNewDay } = require("./controllers/journalController");
const {sessionValidation} = require("./middleware/authMiddleware"); // Acquire required methods for the dashboard


app.use('/', publicRoutes); // For every route, use the same public static loaders

app.set('view engine', 'ejs'); // Allows the usage of EJS over HTML
app.use('/login', authRoute); // Assign authentication route to every login address

app.use('/signup', registryRoute); // Allow registration route to every signup address
app.use('/gjournal', journalRoute); // Allow gratitude journal route to every gjournal address
app.use('/chatbot', chatRoute); // Allow chatbot route to every chatbot address
app.use('/settings', settingRoute); // Allow settings route to every setting address
app.use('/resetpassword', resetPasswordRoute); // Allow reset password to every resetpassword address

/*
    Landing page.
 */
app.get('/', (req, res) => {
    res.redirect('/login');
});

/*
    Forget password page.
 */
app.get('/forgotpw', (req, res) => {
    res.render("forgotpw");
});

/*
    Main Page.
 */
app.use('/dashboard', sessionValidation);
app.get('/dashboard', async (req, res) => {
    let text;
    {
        // Journal resets each day
        if (await isNewDay(req))
            text = await resetJournal(req);
        else
            text = await loadJournal(req);
    }
        res.render("main", {username: req.session.username, text: text});
});

/*
    Easter Egg location, TIC TAC TOE game.
 */
app.use('/letsplay', sessionValidation);
app.get('/letsplay', (req, res) => {
    res.render("tictactoe");
});



/*
    Redirects the user to the reset password page if they are within the range of the token's duration time.
 */
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

/*
    MT -> Mood Tracker.
    Collect the possible selections from the user and send it to the Chat Bot.
 */
app.post('/mt', (req, res) => {
    const {ch1, ch2, ch3, ch4, ch5} = req.body;
    req.session.moods = [ch1, ch2, ch3, ch4, ch5].filter((selectedMood) => selectedMood != null);
    res.redirect('/chatbot');
})

/*
    Once the process is done, the user submits their new password and will be updated in the database.
 */
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

/*
    A simple sign out route. Redirects the user back to login page.
 */
app.post('/signout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

/*
    For every possible address that is non-existent, return with a 404 page.
 */
app.get('/*', (req,res) => {
    res.render('404');
});

/*
    Start the server.
 */
app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
});

