require('ejs');
require('./functions');
require('dotenv').config();
const express = require("express");
const User = require('./models/user');
const session = require("express-session")
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const routes = require('./routes');
const saltRounds = 10;

const {mongoStore} = require('./database/db');
console.log(__dirname);

// Fixed the import of authMiddleware and dataController
const {sessionValidation, authMiddleware} = require('./middleware/authMiddleware');
const { setUserDataController, getUserDataController } = require('./controllers/dataController');
const {loginUser} = require("./controllers/authController");
const {router} = require("express/lib/application");
const {tester} = require("./controllers/testery");
const port = process.env.PORT || 3000;

// const url = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true&w=majority`;

app.use(session({
    secret: process.env.NODE_SESSION_SECRET,
    store: mongoStore,
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: false, // only set this if using HTTPS
        sameSite: 'none'
    }
}));



// Connection to MongoDB
// mongoose.connect(url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
//     .then(() => console.log('MongoDB connected'))
//     .catch((err) => console.log('Error connecting to MongoDB:', err));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/img", express.static("./public/img"));

app.set('view engine', 'ejs');

app.use('/', routes);


app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/dashboard');
    } else
    res.render("landing");
})

app.get('/signUp', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/dashboard');
    } else
        res.render("signup");
})

app.get('/jjournal', (req, res) => {
    if (req.session.authenticated) {
        res.render('journal', {journalContent: req.session.data.jjournal[0]
        });
    } else {
        res.redirect('/');
    }
})

app.get('/mood', (req, res) => {
    // if (req.session.authenticated) {
        res.render('moodTracker')
    // } else {
    //     res.redirect('/');
    // }
})

app.get('/dashboard', (req, res) => {
    console.log(req.session.authenticated);
    if (req.session.authenticated) {
        res.render("main", {username: req.session.username});
    } else
        res.redirect('/');
});

// app.post('/logMood', async (req, res) => {
//     req.session.data.mood[0] = req.body.mood;
//     await setUserData(req.session.token, {mood: req.session.data.mood});
// })
// app.post('/saveJournal', async (req, res) => {
//     req.session.data.jjournal[0] = req.body.journalTextBox;
//     await setUserData(req.session.token, {jjournal: req.session.data.jjournal});
//     res.redirect('/jjournal');
// })

app.post('/login', async (req, res) => {
    await loginUser(req, res);
    if (req.session.authenticated) {
        console.log(req.session.username);
        res.redirect('/dashboard');
    }
    // if (req.body.__loginEmailAddress !=  null) {
    //     // console.log(req.body.__loginEmailAddress);
    // }
    // try {
    //
    //     const token = await authenticateUser(req.body.__loginEmailAddress, req.body.__loginKey);
    //     if (token) {
    //         const data = await getUserData(token);
    //         req.session.authenticated = true;
    //         req.session.username = data.username;
    //         req.session.data = data;
    //         req.session.cookie.maxAge = logOutWhen;
    //         req.session.token = token;
    //         res.redirect('/main');
    //         return;
    //     }
    //     res.redirect('/');
    // } catch (error) {
    //     res.status(401).send({ error: error.message });
    // }
});


app.post('/set-data', async (req, res) => {
    try {
        const data = await setUserData(req.headers.authorization, req.body.data);
        res.send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.get('/get-data', async (req, res) => {
    try {
        const data = await getUserData(req.headers.authorization);
        res.send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    data: { type: Object, default: {} },
    jjournal: { type: Array, default: ["Sample Text"]},
    mood: { type: Array, default: new Array(30)}
});

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});




async function createUser(email ,username, password) {
    const newUser = new User({ email, username, password });
    return await newUser.save();
}

async function authenticateUser(email, password) {
    const user = await User.findOne({ email: email });
    if (user === null) {
        throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid password');
    }

    const token = jwt.sign({ _id: user._id }, 'secret-key', { expiresIn: logOutWhen });
    return token;
}

async function setUserData(token, data) {
    const decoded = jwt.verify(token, 'secret-key');
    const user = await User.findByIdAndUpdate(decoded._id, data, { new: true });
    return user.data;
}

async function getUserData(token) {
    const decoded = jwt.verify(token, 'secret-key');
    const user = await User.findById(decoded._id);
    return user;
}


