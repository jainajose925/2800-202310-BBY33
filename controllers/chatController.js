
// recieveMessage(user, message);

const {generateResponse, generateResponseforMood} = require("../database/openAPI");

async function recieveMessage(req, res) {
    /*
        Call function that connects with ChatGPT, and it shall return the text which will be appended to the responses.
    */
    if (req.session.aiResponses == null) {
        req.session.aiResponses = [];
    }
    if (req.session.moods != null && req.session.moods.length !== 0) {
        req.session.aiResponses.push(await generateResponseforMood(req));
        req.session.moods = null;
        // console.log(req.session.moods);
    } else
        req.session.aiResponses.push(await generateResponse(req.session.userTxt[req.session.userTxt.length - 1]));

    res.redirect('/chatbot');
    // console.log(req.session.aiResponses);
    // res.send(req.session.aiResponses[req.session.userTxt.length - 1]);
    // req.session.aiResponses =
}

module.exports = {recieveMessage};