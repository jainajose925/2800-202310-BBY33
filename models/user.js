const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    const user = await User.findByIdAndUpdate(decoded._id, data, { new: true });
    return user.data;
}

async function getUserData(token) {
    const decoded = jwt.verify(token, 'secret-key');
    const user = await User.findById(decoded._id);
    return user;
}

module.exports = {
    createUser,
    authenticateUser,
    setUserData,
    getUserData,
};
