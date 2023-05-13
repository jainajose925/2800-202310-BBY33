// PlaceHolder for main merge issue.
const { setUserData, getUserData } = require('../database/db');
const { validateAccessToken } = require('./authController');

async function setUserDataController(req, res) {
    try {
        const authToken = req.headers.authorization;
        const data = req.body.data;
        const user = await validateAccessToken(authToken);

        const updatedData = await setUserData(user._id, data);
        res.send({ data: updatedData });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
}

async function getUserDataController(req, res) {
    try {
        const authToken = req.headers.authorization;
        const user = await validateAccessToken(authToken);

        const data = await getUserData(user._id);
        res.send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
}

module.exports = {
    setUserDataController,
    getUserDataController,
};
