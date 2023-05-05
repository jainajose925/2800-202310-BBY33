const joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, insertUser } = require('../database/db');
const saltRounds = 10;

async function loginUser(req, res) {
    let {email, password} = req.body;

    const schema = joi.object({
        email: joi.string().email().required(),
    });

    const result = schema.validate({email});
    if (result.error) {
        res.send(result.error.details[0].message);
        return;
    }
    const account = await findUserByEmail(email);
    if (!account) {
        res.send("Email not found");
        return res.redirect('/login?error=Email not found');
    }
    if (await bcrypt.compare(password, account.password)) {
        const refreshToken = createRefreshToken(account);
        const authToken = await authenticateUser(refreshToken);
        req.session.authToken = authToken;
        req.session.username = account.username;
        req.session.email = account.email;
        req.session.authenticated = true;
        res.redirect('/dashboard');

    } else {
        console.log("wrong password");
        return res.redirect('/login?error=Wrong password');
    }
}

async function registerUser(req, res) {
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
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        res.redirect('/signUp?error=Email already exists');
        return;
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = {
        username,
        email,
        password: hashedPassword
    };
    const insertResult = await insertUser(newUser);
    if (insertResult.insertedCount === 1) {
        const refreshToken = await createRefreshToken();
        const authToken = await authenticateUser(username, password);
        req.session.authToken = authToken;
        req.session.refreshToken = refreshToken;
        req.session.username = username;
        req.session.email = email;
        req.session.authenticated = true;
        res.redirect('/dashboard?newUser=true');
    }
}

async function createRefreshToken(user) {
    const refreshToken = jwt.sign({username: user.username, email: user.email}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
    return refreshToken;
}

async function authenticateUser(refreshToken) {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const authToken = jwt.sign({username: decoded.username, email: decoded.email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
    return authToken;
}

async function validateAccessToken(authToken) {
    try {
        const decoded = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await findUserByEmail(decoded.email);
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    loginUser,
    registerUser,
    createRefreshToken,
    authenticateUser,
    validateAccessToken,
};
