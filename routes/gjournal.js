/*
    This file contains the routes for the journal page.
 */
const express = require('express');
const {getUserEntries, saveJournal, getStart, getEnd, getEntryListByPage, getNumPages} = require("../controllers/journalController");
const router = express.Router();


/*
    Called when the user submits the form.
 */
router.post('/:id',saveJournal);
router.get('/', async (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/gjournal/1');
    } else
        res.redirect('/');
});

/*
    Called when the user visits the journal page.
 */
router.get('/:id', async (req, res) => {
    if (req.session.authenticated) {
        const entryList = await getEntryListByPage(req, req.params.id);
        if (entryList.length !== 0)
            res.render("journal", {req: req, entries: entryList, currPage: req.params.id, numPages: await getNumPages(req)});
        else
            res.redirect('/gjournal/' + (req.params.id - 1));
    } else
        res.redirect('/');

})

module.exports = router;
