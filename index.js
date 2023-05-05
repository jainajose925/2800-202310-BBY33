// import mongoose from 'mongoose'
require('ejs');
require('./functions');
require('dotenv').config();
const express= require("express");
const session = require("express-session")
const app = express();
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const MongoStore = require('connect-mongo');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// module.exports = function (app);
// Connection to MongoDB
// mongodb+srv://${mdb_user}:${mdb_password}@${mdb_host}/sessions

const uri = "mongodb+srv://teddystashtm:0JoeaXgUdjSupD3T@datastore.km7h18l.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const logOutWhen = 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)
// Start the server
const port = process.env.PORT || 3000;
const node_session_secret = process.env.NODE_SESSION_SECRET;

const mdb_host = process.env.MONGODB_HOST;
const mdb_user = process.env.MONGODB_USER;
const mdb_password = process.env.MONGODB_PASSWORD;
const mdb_dbName = process.env.MONGODB_DATABASE;
const mdb_secret = process.env.MONGODB_SESSION_SECRET;

let {database} = include('connection');
const usrCollection = database.db(mdb_dbName).collection('users');

app.use(session({
    secret: node_session_secret,
    saveUninitialized: false,
    resave: true
}));

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('Error connecting to MongoDB:', err));


app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/img", express.static("./public/img"));

app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render("landing");
})

app.get('/signUp', (req, res) => {
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
app.get('/main', (req, res) => {
    if (req.session.authenticated) {
        res.render('main', {username: req.session.username});
    }
    else {
        res.redirect('/');
    }
})

app.post('/logMood', async (req, res) => {
    console.log(req.session.data);
    req.session.data.mood[0] = req.body.mood;
    console.log(req.session.data.mood[0]);
})
app.post('/saveJournal', async (req, res) => {
    req.session.data.jjournal[0] = req.body.journalTextBox;
    res.redirect('/jjournal');
})
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
            res.redirect('/main');
            return;
        }
        res.redirect('/');
    } catch (error) {
        res.status(401).send({ error: error.message });
    }
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

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

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

const User = mongoose.model('User', userSchema);


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
    const user = await User.findByIdAndUpdate(decoded._id, { data }, { new: true });
    return user.data;
}

async function getUserData(token) {
    const decoded = jwt.verify(token, 'secret-key');
    const user = await User.findById(decoded._id);
    return user;
}
