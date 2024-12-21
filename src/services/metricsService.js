/**
 * Calculate the average time taken for a set of questions.
 * @param {Array<Object>} questions - Array of questions with `chatgpt.time_taken`.
 * @returns {Number} - Average time taken.
 */
const calculateAverageTime = (questions) => {
    if (!questions.length) return 0;
    const totalTime = questions.reduce((sum, q) => sum + q.chatgpt.time_taken, 0);
    return (totalTime / questions.length).toFixed(2);
};

/**
 * Generate a summary of time metrics for correct and incorrect responses.
 * @param {Array<Object>} correctAnswers - Questions answered correctly by ChatGPT.
 * @param {Array<Object>} incorrectAnswers - Questions answered incorrectly by ChatGPT.
 * @returns {Object} - Time metrics summary.
 */
const generateTimeMetrics = (correctAnswers, incorrectAnswers) => {
    const avgTimeCorrect = calculateAverageTime(correctAnswers);
    const avgTimeIncorrect = calculateAverageTime(incorrectAnswers);

    return {
        avgTimeCorrect,
        avgTimeIncorrect
    };
};

module.exports = { calculateAverageTime, generateTimeMetrics };