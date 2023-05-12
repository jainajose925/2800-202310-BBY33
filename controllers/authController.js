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
        /* TODO: HTML Design */
        res.redirect('/');
        return;
    }
    if (await bcrypt.compare(password, account.password)) {
        const refreshToken = await createRefreshToken(account);
        req.session.authToken = await authenticateUser(refreshToken);
        const currentDate = new Date();
        const dateOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
        // console.log(dateString); // Output: "05/10/2023"
        req.session.logDate = currentDate.toLocaleDateString(undefined, dateOptions);
        req.session.username = account.username;
        req.session.email = account.email;
        req.session.authenticated = true;
        res.redirect('/dashboard');
        // return {account, password};
        return;


    } else {
        /* TODO: HTML Design */
        console.log("wrong password");
        res.redirect('/');
        return;
        // return res.redirect('/?error=Wrong password');
    }
}

async function registerUser(req, res) {
    let {email, username, password, confirmKey} = req.body;
    if (password !== confirmKey) {
        /* TODO: HTML Design */
        res.redirect('/signUp?error=' + "passwordDoesNotMatch");
        return;
    }
    const schema = joi.object({
        username: joi.string().alphanum().max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().max(30).required()
    });
    const result = schema.validate({username, email, password});

    if (result.error != null) {
        /* TODO: HTML Design */
        res.redirect('/signUp?error=' + result.error.message);
        return;
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        /* TODO: HTML Design */
        res.redirect('/signUp?error=Email already exists');
        return;
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = {
        username,
        email,
        password: hashedPassword
    };

    await insertUser(newUser);
    res.redirect('/');
}

async function createRefreshToken(user) {
    return jwt.sign({username: user.username, email: user.email}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
}

async function authenticateUser(refreshToken) {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    return jwt.sign({
        username: decoded.username,
        email: decoded.email
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
}

async function validateAccessToken(authToken) {
    try {
        const decoded = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET);
        return await findUserByEmail(decoded.email);
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
