// PlaceHolder for main merge issue.
const {findUserByEmail, updateUserData} = require("../database/db");
const {ObjectId} = require("mongodb");
const {func} = require("joi");

const numPerPage = 2;
async function loadJournal(req) {
    const __user = await findUserByEmail(req.session.email);
    let data = dataInstanceOf(__user, req);
    const __entries = await getUserEntries(req);
    const len = __entries[1].length;
    await updateUserData(new ObjectId(__user._id), data);
    if (new Date(req.session.logDate).toLocaleDateString() === getDateObj(__entries[1][len - 1]).toLocaleDateString()) {
        return __entries[0][len - 1];
    } else {
        return "";
    }
}
async function resetJournal(req) {
    const __user = await findUserByEmail(req.session.email);
    let data = dataInstanceOf(__user, req);
    await updateUserData(new ObjectId(__user._id), data);
    return "";
}

async function isNewDay(req) {
    const __user = await findUserByEmail(req.session.email);
    const data = __user.data;
    if (data == null)
        return true;
    else {
        return data[0][0] !== new Date(req.session.logDate).toLocaleDateString();
    }
}

function dataInstanceOf(__user, req) {
    if (__user.data != null) {
        let tempData = __user.data;
        tempData[0][0] = new Date(req.session.logDate).toLocaleDateString();
        return tempData;
    }
    return [[new Date(req.session.logDate).toLocaleDateString()], [""], [new Date(req.session.logDate).toLocaleDateString()]];
}

async function getUserEntries(req) {
    const __user = await findUserByEmail(req.session.email);
    let __data = dataInstanceOf(__user, req);
    // console.log(__data);
    return [__data[1], __data[2]];}

async function saveJournal(req, res){
    const __user = await findUserByEmail(req.session.email);
    let data = dataInstanceOf(__user, req);
    let __entries = await getUserEntries(req);
    if (await isPreviousEntryToday(req, __entries)) {
        __entries[0][__entries[0].length - 1] = req.body.gjournalTxt;
        data[1] = __entries[0];
    } else {
       __entries = addItemToList(__entries, [req.body.gjournalTxt, new Date(req.session.logDate).toLocaleDateString()]);
       data[1] = __entries[0];
       data[2] = __entries[1];
    }

    await updateUserData(new ObjectId(__user._id), data);
    res.redirect('/dashboard');
}

async function isPreviousEntryToday(req, __entries) {
    return new Date(req.session.logDate).toLocaleDateString() === getDateObj(__entries[1][__entries[1].length - 1]).toLocaleDateString();
}

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
    const arry = [__entries[0].slice(getStart(num), getEnd(num)), __entries[1].slice(getStart(num), getEnd(num))];
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