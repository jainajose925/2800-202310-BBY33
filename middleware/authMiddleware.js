// PlaceHolder for main merge issue.
const { validateAccessToken } = require('../controllers/authController');

async function authMiddleware(req, res, next) {
    const authToken = req.headers.authorization;
    if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await validateAccessToken(authToken);
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
}

function sessionValidation(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else
        res.redirect('/');
}

module.exports = {authMiddleware, sessionValidation};
