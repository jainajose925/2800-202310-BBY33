const express = require('express');
const {sendMessage} = require("../middleware/chatMiddleware");
const {recieveMessage} = require("../controllers/chatController");
const router = express.Router();

router.post('/', sendMessage, recieveMessage);
router.get('/', async (req, res) => {
    // console.log(req.session);
    if (req.session.authenticated) {
        if (req.session.userTxt == null || req.session.aiResponses == null) {
            req.session.userTxt = [];
            req.session.aiResponses = [];
        }
        if (req.session.moods != null)
            await recieveMessage(req, res);
        else {

        console.log(req.session.aiResponses);
        console.log(req.session.userTxt);
        res.render("chatbot2", {userTxtArray: req.session.userTxt, botTxtArray: req.session.aiResponses});
        }
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