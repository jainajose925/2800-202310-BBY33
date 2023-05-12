const {findUserByEmail, updateUserData} = require("../database/db");
const {ObjectId} = require("mongodb");

async function loadJournal(req) {
    const __user = await findUserByEmail(req.session.email);
    let data = dataInstanceOf(__user, req);
    const __entries = data[1];
    const len = __entries.length;
    await updateUserData(new ObjectId(__user._id), data);
    return __entries[len - 1];
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
    else
        return data[0][0] !== req.session.logDate;
}

function dataInstanceOf(__user, req) {
    if (__user.data != null) {
        let tempData = __user.data;
        tempData[0][0] = req.session.logDate;
        return tempData;
    }
    return [[req.session.logDate], [""], []];
}

/*
    todo: save journal function. (saveJournal) -> post method
    todo: load all entries (loadEntries) -> upon get /journal
 */

module.exports = {
    loadJournal,
    resetJournal,
    isNewDay
}