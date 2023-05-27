/*
    This file contains the routes for the chatbot module.
 */

const express = require('express');
const {saveBotMessage, deleteSavedMessage, getSavedMessages, getSavedMSGbyPage, numPerPage, getNumPages} = require("../controllers/chatController");
const {startSession, sendMessage, getUserHistory, getBotHistory} = require("../database/openAPI");
const {findUserByEmail} = require("../database/db");
const router = express.Router();

/*
    Called when submitting a message to the chatbot.
 */
router.post('/', async (req, res) => {
    const user = await findUserByEmail(req.session.email)
    if (await sendMessage(user._id, req.body.userTxt))
        res.redirect("/letsplay");
    else
        res.redirect('/chatbot');
});

/*
    Handles "stared" messages.
 */
router.post('/:method', async (req, res) => {
    const data = req.body;
    console.log(data);
    if (req.params.method === "save") {
        await saveBotMessage(req);
    } else {
        await deleteSavedMessage(req);
    }
    res.send('Data received successfully!');
})

/*
    loads the initial chatbot message.
 */
router.get('/', async (req, res) => {
    if (req.session.authenticated) {
        await startSession(req);
        const __user = await findUserByEmail(req.session.email);
        // console.log(req.session.moods.length);
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

/*
    Renders the saved messages page.
 */
router.get('/:id', async (req, res) => {
    const list = (await getSavedMSGbyPage(req, req.params.id));
    console.log(list.length);
    res.render("savedMessages", {savedMSGs: list, currPage: req.params.id, numPages: await getNumPages(req), numPrPage: numPerPage});
});



module.exports = router;