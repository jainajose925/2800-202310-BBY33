const express = require('express');
const {getUserEntries, saveJournal} = require("../controllers/journalController");
const router = express.Router();

router.post('/', saveJournal);
router.get('/', async (req, res) => {
    if (req.session.authenticated) {
        res.render("journal", {req: req, entries: await getUserEntries(req)});
    } else
        res.redirect('/');
});

module.exports = router;
