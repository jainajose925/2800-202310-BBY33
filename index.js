const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

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
const { MongoClient } = require('mongodb');
const routes = require('./routes');

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;

const url = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true&w=majority`;


let mongoStore = MongoStore.create({
    mongoUrl: url,
    crypto: {
        secret: process.env.MONGODB_SESSION_SECRET
    }
});

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

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/img", express.static("./public/img"));

app.set('view engine', 'ejs');

app.use('/', routes);

app.get('/', (req, res) => {
    res.render("landing");
})

app.get('/signUp', (req, res) => {
    res.render("signup");
})

app.get('/login', (req, res) => {
    res.render("login");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

