const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
// const dotenv = require('dotenv');
const path = require('path');
const MongoStore = require('connect-mongo');
// const env = require('../env');

// dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mdb_secret = process.env.MONGODB_SESSION_SECRET;

const url = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true&w=majority`;

const client = new MongoClient(url);
let userCollection;

let mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: {
        secret: mdb_secret
    }
});

async function connectToDatabase() {
    try {
        await client.connect();
        userCollection = client.db(mongodb_database).collection('users');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

async function findUserByEmail(email) {
    return await userCollection.findOne({ email: email });
}

async function insertUser(user) {
    return await userCollection.insertOne(user);
}

async function updateUserData(userId, data) {
    return await userCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { data: data } });
}

async function getUserData(userId) {
    const user = await userCollection.findOne({ _id: ObjectId(userId) });
    return user.data;
}


async function updateName(userId, name) {
    return await userCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { username: name } });
}

async function updateEmail(userId, newEmail) {
    return await userCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { email: newEmail } });
}


async function setUserToken(userId, token, expires) {
    console.log(userId, token, expires)
    try {
        await userCollection.updateOne({ email: userId }, { $set: { token: token, expires: expires } });
    } catch (err) {
        console.error(err);
    }
}


// Will return null if no user is found or if the token is expired
async function getUserFromToken(token) {
    try {
        const user = await userCollection.findOne({token: token});
        if (user.expires > Date.now()) {
            return user;
        } else {
            return null;
        }
    } catch (err) {
        console.error(err);
    }
}

// Password is already hashed
async function resetUserPassword(email, password) {
    try {
        const user = findUserByEmail(email);
        if (user) {
            await userCollection.updateOne({email: email}, {$set: {password: password}});
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err);
    }
}



connectToDatabase().then();

module.exports = {
    mongoStore,
    findUserByEmail,
    insertUser,
    updateUserData,
    getUserData,
    url,

    updateName,
    updateEmail,

    getUserFromToken,
    setUserToken

};
