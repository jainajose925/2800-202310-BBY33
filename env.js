
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

module.exports = {
    PORT: process.env.PORT,
    MONGODB_HOST: process.env.MONGODB_HOST,
    MONGODB_USER: process.env.MONGODB_USER,
    MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
    MONGODB_DATABASE: process.env.MONGODB_DATABASE,
    MONGODB_SESSION_SECRET: process.env.MONGODB_SESSION_SECRET,
    NODE_SESSION_SECRET: process.env.NODE_SESSION_SECRET,
    HOST_URL: process.env.HOST_URL,
    MAIL_USERNAME: process.env.MAIL_USERNAME,
    OAUTH_CLIENTID: process.env.OAUTH_CLIENTID,
    OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
    OAUTH_REFRESH_TOKEN: process.env.OAUTH_REFRESH_TOKEN,
}