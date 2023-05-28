const {findUserByEmail, updateUserData} = require("../database/db"); // These will be used commonly (Saved Bot Messages)
const numPerPage = 6; // How many messages will be displayed per pagination page

/*
    Updates the user's data and appends the current bot message to the data array.
 */
async function saveBotMessage(req) {
    const __user = await findUserByEmail(req.session.email);
    if (__user.data[3] == null)
        __user.data[3] = [req.body.botMsg];
    else {
        if (!__user.data[3].includes(req.body.botMsg))
            __user.data[3].push(req.body.botMsg);
        else return;
    }
    await updateUserData(__user._id, __user.data);
}

/*
    Delete an individual saved message.
 */
async function deleteSavedMessage(req) {
    const __user = await findUserByEmail(req.session.email);
    if (__user.data[3] === null)
        return;
    __user.data[3].splice(req.body.botMsg, 1);
    await updateUserData(__user._id, __user.data);
}

/*
    Return the current saved bot messages from the database.
 */
async function getSavedMessages(req) {
    const __user = await findUserByEmail(req.session.email);
    return (__user.data[3] === null) ? [] : __user.data[3];
}

/*
    Get the ending index of the saved message array based on the current page.
 */
function getEnd(currPage) {
    return Math.max(0, ((currPage - 1) * numPerPage) + numPerPage);
}

/*
    Get the starting index of the saved message array based on the current page.
 */
function getStart(currPage) {
    return Math.max(0, ((currPage - 1) * numPerPage));
}

/*
    getEnd and getStart are helper functions for this main function.
    Returns at least 0 and max 6 saved messages in an array.
 */
async function getSavedMSGbyPage(req, num) {
    const __messages = await getSavedMessages(req);
    return __messages.slice(getStart(num), getEnd(num));
}

/*
    Get number of pages.
 */
async function getNumPages(req) {
    const len = (await getSavedMessages(req)).length;
    return Math.ceil(len / numPerPage);
}

/*
    Export the required functions and variables.
 */
module.exports = {
    saveBotMessage,
    getSavedMessages,
    deleteSavedMessage,
    getSavedMSGbyPage,
    getNumPages,
    numPerPage
};