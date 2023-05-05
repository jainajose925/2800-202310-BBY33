const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;

const url = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true&w=majority`;

const client = new MongoClient(url);
let userCollection;

async function connectToDatabase() {
    // TODO database connection logic here...
}

async function findUserByEmail(email) {
    // TODO find user by email logic here...
    return await userCollection.findOne({ email });
}

async function insertUser(user) {
    // TODO insert user logic here...
    return await userCollection.insertOne(user);
}

async function updateUserData(userId, data) {
    // TODO update user data logic here...
    return await userCollection.updateOne({ _id: userId }, { $set: { data: data } });
}

async function getUserData(userId) {
    // TODO get user data logic here...
    const user = await userCollection.findOne({ _id: userId });
    return user.data;
}

connectToDatabase();

module.exports = {
    findUserByEmail,
    insertUser,
    updateUserData,
    getUserData,
};
