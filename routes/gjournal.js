// PlaceHolder for main merge issue.
const express = require('express');
const {getUserEntries, saveJournal, getStart, getEnd, getEntryListByPage, getNumPages} = require("../controllers/journalController");
const router = express.Router();

router.post('/:id', saveJournal);
router.get('/', async (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/gjournal/1');
        // res.render("journal", {req: req, entries: await getUserEntries(req)});
    } else
        res.redirect('/');
});

router.get('/:id', async (req, res) => {
    if (req.session.authenticated) {
        // if ((await getUserEntries(req)).length === 0)
        const entryList = await getEntryListByPage(req, req.params.id);
        console.log(req.params.id);
        // console.log(await getNumPages(req));
        if (entryList.length !== 0)
            res.render("journal", {req: req, entries: entryList, currPage: req.params.id, numPages: await getNumPages(req)});
        else
            res.redirect('/gjournal/' + (req.params.id - 1));
    } else
        res.redirect('/');

})

module.exports = router;
