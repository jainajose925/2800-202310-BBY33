// Colliding Ideas with Emma and Teddy
const systemMessages = require('../systemMessages.json');
const {findUserByEmail} = require("./db");
const {CHATGPT_API_KEY} = require("../env");

let session = {};

async function startSession(req) {
    const __user = await findUserByEmail(req.session.email);
    if (!isSessionArrayEmpty(__user._id))
        return;
    const __userName = __user.username;
    let __moods = [];
    if (req.session.moods != null && req.session.length !== 0)
        __moods = req.session.moods;

    await startSessionInfo(__user._id, __userName, __moods);

}

async function startSessionInfo(userID, username, moods) {
    const {ChatGPTAPI}= await import("chatgpt");
    session[userID] = {}; // Create JSON array
    session[userID].instance = new ChatGPTAPI({
        apiKey: CHATGPT_API_KEY,
        completionParams: {
            model: "gpt-3.5-turbo"
        }
    });

    session[userID].username = username;
    session[userID].moods = moods;
    session[userID].botHistory = [[]]; // [ [TXT] , [TIME] ]
    session[userID].userHistory = [[]]; // [ [TXT] , [TIME] ]

}

function getCorrectPrompt(input) {
    switch (true) {
        // case input.includes("sad"):
        //     return "I feel sad. Please help.";
        default:
            return input;
    }
}

/*

    TODO: FYI Emma's code but Teddy configured its modifications to match with our data.
 */
async function sendMessage(userID, message) {
    // console.log(session[userID]);
    let msg = {
        text: getCorrectPrompt(message),
        user: session[userID].username,
        time: new Date()
    }

    const tempArray = [msg.text, msg.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })];
    session[userID].userHistory.push(tempArray);
    /* Valorant: Chamber Reference */
    if (message.toUpperCase().includes("YOU WANT TO PLAY?")) {
        session[userID].botHistory.push(["Let's Play!", (new Date()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })]);
        return true;
    }

    const options = {};
    if (session[userID].botHistory.length > 0) {
        options.parentMessageId = session[userID].botHistory[session[userID].botHistory.length - 1].id;
    }
    options.systemMessage = systemMessages.load;

    const res = await session[userID].instance.sendMessage(JSON.stringify(msg), options);

    const date = (new Date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    let botTxtList;
    if (res.text.includes("{")) {
        const jsonTxt = JSON.parse(res.text);
        botTxtList = ([jsonTxt['text'], date]);
    } else
        botTxtList = [res.text, date];

    session[userID].botHistory.push(botTxtList);
    return false;

}
function isSessionArrayEmpty(userID) {
    return session[userID] == null;
}

async function getUserHistory(userID) {
    if (!isSessionArrayEmpty(userID))
        return session[userID].userHistory;
    else
        return [];
}

async function getBotHistory(userID) {
    if (!isSessionArrayEmpty(userID))
        return session[userID].botHistory;
    else
        return [];
}

/*

    TODO: FYI Emma's code but Teddy configured its modifications to match with our data.
 */
async function endSession(userID) {
    // const options = {};
    // if (session[userID].history.length > 0) {
    //     options.parentMessageId = sessions[userId].history[sessions[userId].history.length - 1].id;
    // }
    // options.systemMessage = systemMessages.load;


    // const res = await sessions[userId].instance.sendMessage(systemMessages.end, options);

    // await db.updateUserData(userId, {chatHistory: sessions[userId].history, userInfo: res});
    delete session[userID];

}


module.exports = {
    startSession,
    sendMessage,
    getUserHistory,
    getBotHistory
};