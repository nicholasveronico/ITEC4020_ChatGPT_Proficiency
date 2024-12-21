const { OpenAI }  = require('openai');
const config = require('../../config.json');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: config.api.openaiKey
});

/**
 * Call the OpenAI ChatGPT API
 * @param {String} prompt - The prompt to send to ChatGPT
 * @returns {String} - ChatGPT's response
 */
const callChatGPT = async (prompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
        });

        return response.choices[0].message.content;

    } catch (error) {;
        console.error(`[${new Date().toISOString()}] Error calling OpenAI API:`, error.response?.data || error.message);
        throw error;
    }
};

module.exports = { callChatGPT };
