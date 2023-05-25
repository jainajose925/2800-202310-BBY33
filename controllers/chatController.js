const {generateResponse, generateResponseforMood} = require("../database/openAPI");
const {findUserByEmail, updateUserData, getUserData} = require("../database/db");
const {ObjectId} = require("mongodb");

const numPerPage = 6;

async function saveBotMessage(req) {
    const __user = await findUserByEmail(req.session.email);
    if (__user.data[3] == null)
        __user.data[3] = [req.body.botMsg];
    else {
        if (!__user.data[3].includes(req.body.botMsg))
            __user.data[3].push(req.body.botMsg);
        else return;
    }
    await updateUserData(new ObjectId(__user._id), __user.data);
}

async function deleteSavedMessage(req) {
    const __user = await findUserByEmail(req.session.email);
    if (__user.data[3] === null)
        return;
    console.log(req.body);
    __user.data[3].splice(req.body.botMsg, 1);
    await updateUserData(new ObjectId(__user._id), __user.data);
}
async function getSavedMessages(req) {
    const __user = await findUserByEmail(req.session.email);
    // let __data = await getUserData(new ObjectId(__user._id));
    return (__user.data[3] === null) ? [] : __user.data[3];
}

function getEnd(currPage) {
    return Math.max(0, ((currPage - 1) * numPerPage) + numPerPage);
}

function getStart(currPage) {
    return Math.max(0, ((currPage - 1) * numPerPage));
}

async function getSavedMSGbyPage(req, num) {
    // console.log(getStart())
    const __messages = await getSavedMessages(req);
    const arry = __messages.slice(getStart(num), getEnd(num));
    console.log(arry);
        // [__messages[0].slice(getStart(num), getEnd(num)),
        // __entries[1].slice(getStart(num), getEnd(num))];
    return arry;
    // return (await getUserEntries(req)).slice(
    //     getStart(num), getEnd(num));
}

async function getNumPages(req) {
    const len = (await getSavedMessages(req)).length;
    return Math.ceil(len / numPerPage);
}

module.exports = {
    saveBotMessage,
    getSavedMessages,
    deleteSavedMessage,
    getEnd,
    getStart,
    getSavedMSGbyPage,
    getNumPages,
    numPerPage
};