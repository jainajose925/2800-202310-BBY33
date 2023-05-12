const {findUserByEmail, updateUserData} = require("../database/db");
const {ObjectId} = require("mongodb");

async function loadJournal(req) {
    const __user = await findUserByEmail(req.session.email);
    let data = dataInstanceOf(__user, req);
    const __entries = [data[1], data[2]];
    const len = __entries[0].length;
    await updateUserData(new ObjectId(__user._id), data);
    if (new Date(req.session.logDate).toLocaleDateString() === __entries[1][len - 1]) {
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
    return [[new Date(req.session.logDate).toLocaleDateString()], [""], []];
}

async function getUserEntries(req) {
    const __user = await findUserByEmail(req.session.email);
    let __data = __user.data;
    return [__data[1], __data[2]];}


    /*
        todo: save journal function. (saveJournal) -> post method
        todo: load all entries (loadEntries) -> upon get /journal
     */

module.exports = {
    loadJournal,
    resetJournal,
    isNewDay,
    getUserEntries
}