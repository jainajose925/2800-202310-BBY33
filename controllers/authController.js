/*
    Combination of Authorization and Authentication
 */
const joi = require('joi'); // Used as a method to prevent NoSQL Injection attacks. Validates the format of inputs
const bcrypt = require('bcrypt'); // Used to hash the passwords
const jwt = require('jsonwebtoken'); // Used to create tokens for users
const { findUserByEmail, insertUser, updateUserPassword, updateUserData, setUserToken} = require('../database/db'); // Acquire modules from the database javascript file
const {REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET,
    MAIL_USERNAME,
    OAUTH_CLIENTID,
    OAUTH_CLIENT_SECRET,
    OAUTH_REFRESH_TOKEN
} = require("../env"); // Acquire the required environment variables
const crypto = require("crypto"); // Used to generate tokens
const nodemailer = require("nodemailer"); // Used to transport email to users
const saltRounds = 10; // Helper variable for bcrypt, determines the randomness
const expiryTime = 1 * 60 * 60 * 1000; // HOUR | MINUTE | SECOND | MILLISECOND, time till the session ends


/*
    Constant variable for the sender's information.
 */
const oauth2Client = {
    user: MAIL_USERNAME,
    clientId: OAUTH_CLIENTID,
    clientSecret: OAUTH_CLIENT_SECRET,
    refreshToken: OAUTH_REFRESH_TOKEN
};

/*
    Assign the sender's information to the Gmail's services.
 */
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: oauth2Client.user,
        clientId: oauth2Client.clientId,
        clientSecret: oauth2Client.clientSecret,
        refreshToken: oauth2Client.refreshToken
    },
});

/*
    Validate their email and password, making sure it is contained in the database and assigning their session with the required information.
 */
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
        res.redirect('/login/userNotFound');
        return;
    }
    if (await bcrypt.compare(password, account.password)) {
        const refreshToken = await createRefreshToken(account);
        req.session.authToken = await authenticateUser(refreshToken);
        let currdate = new Date();
        // Setting hours to 0 to allow the feature where one of the journal entries would say Yesterday instead of a raw date
        currdate.setHours(0,0,0,0);
        req.session.logDate = currdate;
        req.session.username = account.username;
        req.session.email = account.email;
        req.session.authenticated = true;
        req.session.goal = account.goal;
        req.session.maxAge = expiryTime;

        res.redirect('/dashboard');
        return;

    } else {
        // Wrong Password.
        res.redirect('/login/wrongPassword');
        return;
    }
}

/*
    When creating their account, make sure their password matches and their email must be unique.
 */
async function registerUser(req, res) {
    let {email, username, password, confirmKey, goal} = req.body;
    if (password !== confirmKey) {
        res.redirect('/login/passwordNotMatched');
        return;
    }
    const schema = joi.object({
        username: joi.string().alphanum().max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().max(30).required()
    });
    const result = schema.validate({username, email, password});

    if (result.error != null) {
        res.redirect('/login/' + result.error.message);
        return;
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        res.redirect('/login/emailIsTaken');
        return;
    }
    // Hash their password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a template of their data
    const newUser = {
        username,
        email,
        password: hashedPassword,
        goal: goal,
        data: [[(new Date()).toLocaleDateString()], [`Hello ${username}, and welcome to Ground'd! This is your Gratitude Journal, reminding what you should be grateful about.`], [(new Date()).toLocaleDateString()], [], ["user"]]
    };

    // Insert to the database
    await insertUser(newUser);
    res.redirect('/');
}

// Password is not hashed

/*
    Once submitting the form of resetting the password, it will be rehashed and updated into the database.
 */
async function resetPassword(userEmail, password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await updateUserPassword(userEmail, hashedPassword);

}

/*
    Emma's Function.
    Create a refresh token for the user.
 */
async function createRefreshToken(user) {
    return jwt.sign({username: user.username, email: user.email}, REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
}

/*
    Emma's Function.
    Check if the refresh token is valid.
 */
async function authenticateUser(refreshToken) {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    return jwt.sign({
        username: decoded.username,
        email: decoded.email
    }, ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
}

/*
    Emma's Function.
    Used to create reset password tokens.
    The time they have till they can access the reset password page.
 */
async function generateToken(expiration, account) {
    const token = await crypto.randomBytes(20).toString('hex');
    const tokenExpiration = Date.now() + expiration * 1000;
    await setUserToken(account, token, tokenExpiration);
    return token;
}

/*
    Validate the access token.
 */
async function validateAccessToken(authToken) {
    try {
        const decoded = jwt.verify(authToken, ACCESS_TOKEN_SECRET);
        return await findUserByEmail(decoded.email);
    } catch (error) {
        throw new Error(error.message);
    }
}

/*
    Returns true if the user is an admin otherwise false.
 */
async function isAdmin(req) {
    const __user = await findUserByEmail(req.session.email);
    if (__user.data[4] == null) {
        __user.data[4] = ["user"];
        await updateUserData(__user._id, __user.data);
        return false;
    }
    return __user.data[4] == "admin";

}

/*
    Export the required functions and variables.
 */
module.exports = {
    loginUser,
    registerUser,
    createRefreshToken,
    validateAccessToken,
    resetPassword,
    isAdmin,
    generateToken,
    transporter,
    oauth2Client
};
