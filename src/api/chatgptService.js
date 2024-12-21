const { callChatGPT } = require('./chatgpt');
const config = require('../../config.json');

/**
 * Get ChatGPT answer for a multiple choice question
 * @param {String} question - The question to ask ChatGPT
 * @param {String} a - Option A
 * @param {String} b - Option B
 * @param {String} c - Option C
 * @param {String} d - Option D
 * @returns {String} - ChatGPT's answer
 */
const getChatGPTAnswer = async (question, a, b, c, d) => {
    const prompt = `${config.api.prompt} ${question}. The possible answers are the following: A. ${a}. B. ${b}. C. ${c}. D. ${d}.`;
    return await callChatGPT(prompt);
};

module.exports = { getChatGPTAnswer };
