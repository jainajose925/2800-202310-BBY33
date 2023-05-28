const { updateUserData, getUserData } = require('../database/db'); // Get the functions that manipulate the user's data
const { validateAccessToken } = require('./authController'); // Acquire the function of validating the access token

/*
    Updates the user data.
 */
async function setUserDataController(req, res) {
    try {
        const authToken = req.headers.authorization;
        const data = req.body.data;
        const user = await validateAccessToken(authToken);

        const updatedData = await updateUserData(user._id, data);
        res.send({ data: updatedData });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
}

/*
    Get the user's data.
 */
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

/*
    Export the required functions.
 */
module.exports = {
    setUserDataController,
    getUserDataController,
};
