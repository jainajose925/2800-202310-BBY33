/**
 * Is used when the current date is one of the developer's birthday.
 * @param req request variable from server side
 * @returns {string} "Terminal" when date is 10/2
 */
function getDevNames(req) {
    const currYear = req.session.logDate.getFullYear();
    const oneDay = 24 * 60 * 60 * 1000; // one day in milliseconds
    let td = new Date(currYear, 9, 2, 0, 0, 0, 0);
    let jj = new Date();
    let ema = new Date();
        // date.getTime()
    // if (req.session.logDate - td.getTime() === oneDay)
    switch (true) {
        case req.session.logDate - td.getTime() === oneDay:
            return "Terminal";
    }

}