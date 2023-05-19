const express = require('express');
// const {sendMessage} = require("../middleware/chatMiddleware");
const {saveBotMessage} = require("../controllers/chatController");
const {startSession, sendMessage, getUserHistory, getBotHistory} = require("../database/openAPI");
const {findUserByEmail} = require("../database/db");
const router = express.Router();

router.post('/', async (req, res) => {
    const user = await findUserByEmail(req.session.email)
    if (await sendMessage(user._id, req.body.userTxt))
        res.redirect("/letsplay");
    else
        res.redirect('/chatbot');
});

router.post('/:method', async (req, res) => {
    const data = req.body;
    console.log(data);
    await saveBotMessage(req);
    res.send('Data received successfully!');
})
router.get('/', async (req, res) => {
    if (req.session.authenticated) {
        await startSession(req);
        const __user = await findUserByEmail(req.session.email);
        if (req.session.moods != null && req.session.moods.length > 0) {
            let message = "I feel"
            for (let i = 0; i < req.session.moods.length; i++)
                message += ` ${req.session.moods[i]},`;
            message += " can you please suggest me coping ideas?";
            await sendMessage(__user._id, message);
            req.session.moods = null;
        }
        res.render("chatbot2", {userTxtArray: await getUserHistory(__user._id), botTxtArray: await getBotHistory(__user._id)});
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