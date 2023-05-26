const {findUserByEmail, updateUserData} = require("../database/db"); // Get the functions that return the user and updates its data
const numPerPage = 4; // Number of entries that will display per pagination page

/*
    Used as the false result of isNewDay.
    Loads the current journal saved, otherwise an empty string.
 */
async function loadJournal(req) {
    const __user = await findUserByEmail(req.session.email);
    let data = dataInstanceOf(__user, req);
    const __entries = await getUserEntries(req);
    const len = __entries[1].length;
    await updateUserData(__user._id, data);
    if (new Date(req.session.logDate).toLocaleDateString() === getDateObj(__entries[1][len - 1]).toLocaleDateString()) {
        return __entries[0][len - 1];
    } else {
        return "";
    }
}

/*
    Used as the true result of isNewDay.
    Resets the journal entry and returns an empty string.
 */
async function resetJournal(req) {
    const __user = await findUserByEmail(req.session.email);
    let data = dataInstanceOf(__user, req);
    await updateUserData(__user._id, data);
    return "";
}

/*
    Determines if the current log date, (generated after the user logs in) is the different as the previous journal's
    date.
    Return true if different or the data is null, otherwise false.
 */
async function isNewDay(req) {
    const __user = await findUserByEmail(req.session.email);
    const data = __user.data;
    if (data[0] == null)
        return true;
    else
        return data[0][0] !== new Date(req.session.logDate).toLocaleDateString();
}

/*
    The name is inspired by a singleton.
    Previous handlers (Check if the user data is null)
    update their log date.
    It is impossible to get a null value for data, as for every registry of a user, their data gets auto-generated.
 */
function dataInstanceOf(__user, req) {
    let tempData = __user.data;
    tempData[0][0] = new Date(req.session.logDate).toLocaleDateString();
    return tempData;
}

/*
    Get the data and its second and third index to get the data about user entries.
    data = [ [logDate], [journalText], [journalTime], [chatBotText], [userType] ]
 */
async function getUserEntries(req) {
    const __user = await findUserByEmail(req.session.email);
    let __data = dataInstanceOf(__user, req);
    return [__data[1], __data[2]];
}

/*
    Saves the current journal to the database.
 */
async function saveJournal(req, res){
    const __user = await findUserByEmail(req.session.email);
    let data = dataInstanceOf(__user, req);
    let __entries = await getUserEntries(req);
    // Overwrite the current journal
    if (await isPreviousEntryToday(req, __entries)) {
        __entries[0][__entries[0].length - 1] = req.body.gjournalTxt;
        data[1] = __entries[0];
    } else {
       __entries = addItemToList(__entries, [req.body.gjournalTxt, new Date(req.session.logDate).toLocaleDateString()]);
       data[1] = __entries[0];
       data[2] = __entries[1];
    }

    await updateUserData(__user._id, data);
    res.redirect('/dashboard');
}

/*
    Returns if the current log date session is the same as the last entry's log date.
 */
async function isPreviousEntryToday(req, __entries) {
    return new Date(req.session.logDate).toLocaleDateString() === getDateObj(__entries[1][__entries[1].length - 1]).toLocaleDateString();
}

/*
    Get the maximum index of
 */
function getEnd(currPage) {
    return Math.max(0, ((currPage - 1) * numPerPage) + numPerPage);
}

function getStart(currPage) {
    return Math.max(0, ((currPage - 1) * numPerPage));
}

/*
    Req contains the currPage.
 */
async function getEntryListByPage(req, num) {
    const __entries = await getUserEntries(req);
    const arry = [__entries[0].slice(getStart(num), getEnd(num)),
        __entries[1].slice(getStart(num), getEnd(num))];
    return arry;
    // return (await getUserEntries(req)).slice(
    //     getStart(num), getEnd(num));
}
async function getNumPages(req) {
    const len = (await getUserEntries(req))[0].length;
    return Math.ceil(len / numPerPage);
}
/*
    Helper Function
    __list is [[entriestxt], [entrieslogTime]]
    __item is [currText, logTime];
    // but __item is [[curr], [(]]
 */
function addItemToList(__list, __item) {
    __list[0].push(__item[0]);
    __list[1].push(__item[1]);
    return __list;
}

function getDateObj(dateString) {
    let tempDate;
    if (dateString == null) {
        return new Date();
    }
    if (dateString.includes("/")) {
        tempDate = dateString.split("/");
        return new Date(parseInt(tempDate[2]), parseInt(tempDate[0]) - 1, parseInt(tempDate[1]));
    } else {
        tempDate = dateString.split("-");
        return new Date(parseInt(tempDate[0]), parseInt(tempDate[1]) - 1, parseInt(tempDate[2]));
    }
}

module.exports = {
    loadJournal,
    resetJournal,
    isNewDay,
    getUserEntries,
    saveJournal,
    getStart,
    getEnd,
    getEntryListByPage,
    getNumPages,
    getDateObj
}