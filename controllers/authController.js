const joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, insertUser } = require('../database/db');
const saltRounds = 10;

async function loginUser(req, res) {
    // TODO login logic here...
}

async function registerUser(req, res) {
    // TODO registration logic here...
}

async function createRefreshToken(user) {
    // TODO token creation logic here...
}

async function authenticateUser(refreshToken) {
    // TODO authentication logic here...
}

async function validateAccessToken(authToken) {
    // TODO token validation logic here...
}

module.exports = {
    loginUser,
    registerUser,
    createRefreshToken,
    authenticateUser,
    validateAccessToken,
};
