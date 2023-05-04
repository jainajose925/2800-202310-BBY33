
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

require("./utils.js");
const express = require('express');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const port = process.env.PORT || 3000;
const joi = require('joi');
const jwt = require('jsonwebtoken');


const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;

let {database} = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

app.use(express.urlencoded({extended: false}));

const url = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true&w=majority`;

console.log(url)
let mongoStore = MongoStore.create({
    mongoUrl: url,
    crypto: {
        secret: mongodb_session_secret
    }
});

app.use(session({
    secret: node_session_secret,
    store: mongoStore,
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: false, // only set this if you're using HTTPS
        sameSite: 'none'
    }
}));

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

app.get('/login', (req, res) => {
    res.render("login");
})

app.post('/register', async (req, res) => {
    try {
        await createUser(req.body.username, req.body.password);
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});


app.post('/login', async (req, res) => {
    try {
        const token = await authenticateUser(req.body.username, req.body.password);
        res.send({ token });
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

app.post('/api/login', async (req, res) => {
    let {email, password} = req.body;
    console.log("username: " + email)
    const schema = joi.object({
        email: joi.string().email().required(),
    });

    const result = schema.validate({email});
    if (result.error) {
        res.send(result.error.details[0].message);
        return;
    }
    const account = await userCollection.find({email}).project({username: 1, email: 1, password: 1, _id: 1}).toArray();
    if (account.length === 0) {
        res.send("Email not found");
        return res.redirect('/login?error=Email not found');
    }
    if (await bcrypt.compare(password, account[0].password)) {
        const authToken = await authenticateUser(account[0].username, account[0].password);
        req.session.authToken = authToken;
        req.session.username = account[0].username;
        req.session.email = account[0].email;
        req.session.authenticated = true;
        res.redirect('/dashboard');

    } else {
        console.log("wrong password");
        return res.redirect('/login?error=Wrong password');
    }
});

app.post('/api/register', async (req, res) => {
    let {username, email, password} = req.body;
    const schema = joi.object({
        username: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(8).max(30).required(),
    });
    const result = schema.validate({username, email, password});
    if (result.error) {
        res.redirect('/signUp?error=' + result.error.details[0].message);
        return;
    }
    const existingUser = await userCollection.find({email}).project({username: 1, email: 1, password: 1, _id: 1}).toArray();
    if (existingUser.length > 0) {
        res.redirect('/signUp?error=Email already exists');
        return;
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = {
        username,
        email,
        password: hashedPassword

    };
    const insertResult = await userCollection.insertOne(newUser);
    if (insertResult.insertedCount === 1) {
        const authToken = await authenticateUser(username, password);
        req.session.authToken = authToken;
        req.session.username = username;
        req.session.email = email;
        req.session.authenticated = true;
        res.redirect('/dashboard?newUser=true');
    }

});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});






async function createUser(username, password) {
    const newUser = new User({ username, password });
    return await newUser.save();
}

async function authenticateUser(username, password) {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid password');
    }
    const token = jwt.sign({ _id: user._id }, 'secret-key', { expiresIn: '1h' });
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
    return user.data;
}


