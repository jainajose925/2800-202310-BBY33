const {findUserByEmail} = require("../database/db");


function sendMessage(req, res, next) {
    if (req.session.moods == null)
        req.session.userTxt.push(req.body.userTxt);

    // req.session.userTxt = req.body.userInput; /* Will be an array and use the last element (recent one) to communicate with the AI. */
    // const __user = await findUserByEmail(req.session.email);
    /* call recieveMessage(user, message); */
    next();
    // req.body.userInput;
}

module.exports = {sendMessage};