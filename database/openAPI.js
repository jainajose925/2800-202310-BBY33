const { Configuration, OpenAIApi } = require("openai");
const {OPENAI_API_KEY} = require("../env");

const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function getCorrectPrompt(input) {
    if (input.includes("__listType")) {
        const moodArray = input.split(",");
        const len = moodArray.length;
        let promptString = "I feel ";
        for (let i = 0; i < len - 1; i++)
            promptString += `${moodArray[i]}, `;
        promptString += "please give me coping methods.";
        return promptString;
    }
    switch (true) {

        case input.includes("sad"):
            return "I feel sad. Please help.";
        default:
            return input;
    }
}

async function generateResponse(input) {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: getCorrectPrompt(input),
            temperature: 0.1,
            max_tokens: 3200
        });
        // const maxTokens = response.
        // console.log('Maximum tokens:', maxTokens);
        return response.data.choices[0].text;
    } catch (error) {
        if (error.response) {
            console.error(error.response.status, error.response.data);
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
        }
    }
}

async function generateResponseforMood(req) {
    return await generateResponse(req.session.moods + ",__listType");

}


module.exports = {generateResponse, generateResponseforMood};