require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,
    MONGODB_HOST: process.env.MONGODB_HOST,
    MONGODB_USER: process.env.MONGODB_USER,
    MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
    MONGODB_DATABASE: process.env.MONGODB_DATABASE,
    MONGODB_SESSION_SECRET: process.env.MONGODB_SESSION_SECRET,
    NODE_SESSION_SECRET: process.env.NODE_SESSION_SECRET
}