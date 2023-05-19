const express = require('express');
// const {sendMessage} = require("../middleware/chatMiddleware");
const {recieveMessage} = require("../controllers/chatController");
const {startSession, sendMessage, getUserHistory, getBotHistory} = require("../database/openAPI");
const {findUserByEmail} = require("../database/db");
const router = express.Router();

router.post('/', async (req, res) => {
    const user = await findUserByEmail(req.session.email)
    await sendMessage(user._id, req.body.userTxt);

    res.redirect('/chatbot');
});
router.get('/', async (req, res) => {
    // console.log(req.session);
    if (req.session.authenticated) {
        await startSession(req);
        const __user = await findUserByEmail(req.session.email);
        console.log(await getUserHistory(__user._id));
        res.render("chatbot2", {userTxtArray: await getUserHistory(__user._id), botTxtArray: await getBotHistory(__user._id)});
        // }
    } else
        res.redirect('/');
});

// router.get('/', (req, res) => {
//     console.log(req.session);
//     if (req.session.authenticated) {
//         res.render("chatbot2", {username: req.session.username});
//     } else
//         res.redirect('/');
// });

module.exports = router;