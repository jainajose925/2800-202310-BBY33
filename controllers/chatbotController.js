const { ChatGPTAPI } = require('chatgpt');
const systemMessages = require('../systemMessages.json');
const db = require('../database/db');
const env = require('../env.js');

let sessions = {};

async function startSession(userId, userMood) {

    const __userName = await db.getUserData(userId, "username");
    const __userMood = userMood;
    const __userLocal = await db.getUserData(userId, "location") || "unknown";
    const __userInfo = await db.getUserData(userId, "userInfo") || null;
    await startSessionInfo(userId, __userName, __userMood, __userLocal, __userInfo);
    return true;
}


async function startSessionInfo(userId, userName, userMood, userLocal, userInfo) {
    sessions[userId] = {};
    sessions[userId].instance = new ChatGPTAPI({
        apiKey: env.CHATGPT_API_KEY,
        completionParams: {
            maxTokens: 150,
            model: "gpt-3.5-turbo"
        }
    });
    sessions[userId].userName = userName;
    sessions[userId].userMood = userMood;
    sessions[userId].userLocal = userLocal;
    sessions[userId].userPreviousInfo = userInfo;
    sessions[userId].history = [];
}

async function sendMessage(userId, message) {
    let msg = {
        text: message,
        user: sessions[userId].userName,
        mood: sessions[userId].userMood,
        location: sessions[userId].userLocal,
        time: Date.now()
    };

    if (sessions[userId].userPreviousInfo) {
        msg.previousInfo = sessions[userId].userPreviousInfo;
    }

    const options = {};
    if (sessions[userId].history.length > 0) {
        options.parentMessageId = sessions[userId].history[sessions[userId].history.length - 1].id;
    }
    options.systemMessage = systemMessages.load;


    const res = await sessions[userId].instance.sendMessage(JSON.stringify(msg), options);

    sessions[userId].history.push(res);
    return res;
}

async function endSession(userId) {

    const options = {};
    if (sessions[userId].history.length > 0) {
        options.parentMessageId = sessions[userId].history[sessions[userId].history.length - 1].id;
    }
    options.systemMessage = systemMessages.load;


    const res = await sessions[userId].instance.sendMessage(systemMessages.end, options);

    await db.updateUserData(userId, {chatHistory: sessions[userId].history, userInfo: res});
    delete sessions[userId];

}