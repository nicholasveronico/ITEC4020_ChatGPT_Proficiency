const { getModelForCollection, fetchAnsweredQuestions, fetchCollections } = require('../database/dataService.js');

/**
 * Calculate the accuracy of ChatGPT's answers for a specific collection.
 * @param {String} collectionName - Name of the MongoDB collection.
 * @returns {Object} - Accuracy metrics.
 */
const calculateAccuracy = async (collectionName) => {
    const Model = getModelForCollection(collectionName);

    // Fetch all answered questions
    const answeredQuestions = await fetchAnsweredQuestions(collectionName);

    const totalQuestions = answeredQuestions.length;
    const correctAnswers = answeredQuestions.filter(
        (q) => q.correct_answer === q.chatgpt.answer
    ).length;

    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
        collection: collectionName,
        totalQuestions,
        correctAnswers,
        accuracy: `${accuracy.toFixed(2)}%`,
    };
};

/**
 * Analyze the impact of time taken on ChatGPT's accuracy for a specific collection.
 * @param {String} collectionName - Name of the MongoDB collection.
 * @returns {Object} - Time impact metrics.
 */
const analyzeTimeImpact = async (collectionName) => {
    const Model = getModelForCollection(collectionName);

    // Fetch all answered questions
    const answeredQuestions = await fetchAnsweredQuestions(collectionName);

    const correctAnswers = answeredQuestions.filter(
        (q) => q.correct_answer === q.chatgpt.answer
    );
    const incorrectAnswers = answeredQuestions.filter(
        (q) => q.correct_answer !== q.chatgpt.answer
    );

    // Calculate average time for correct and incorrect answers
    const avgTimeCorrect = correctAnswers.reduce((sum, q) => sum + q.chatgpt.time_taken, 0) / (correctAnswers.length || 1);
    const avgTimeIncorrect = incorrectAnswers.reduce((sum, q) => sum + q.chatgpt.time_taken, 0) / (incorrectAnswers.length || 1);

    return {
        collection: collectionName,
        avgTimeCorrect: avgTimeCorrect.toFixed(2),
        avgTimeIncorrect: avgTimeIncorrect.toFixed(2),
        correctCount: correctAnswers.length,
        incorrectCount: incorrectAnswers.length,
    };
};

/**
 * Run accuracy and time impact analysis across all collections.
 * @returns {Array<Object>} - Array of analysis results for each collection.
 */
const runAnalysis = async () => {
    const collections = await fetchCollections();
    const results = [];

    for (const collection of collections) {
        const accuracy = await calculateAccuracy(collection);
        const timeImpact = await analyzeTimeImpact(collection);

        results.push({
            collection: collection,
            accuracy: accuracy.accuracy,
            totalQuestions: accuracy.totalQuestions,
            correctAnswers: accuracy.correctAnswers,
            avgTimeCorrect: timeImpact.avgTimeCorrect,
            avgTimeIncorrect: timeImpact.avgTimeIncorrect,
            correctCount: timeImpact.correctCount,
            incorrectCount: timeImpact.incorrectCount,
        });
    }

    return results;
};

module.exports = { calculateAccuracy, analyzeTimeImpact, runAnalysis };
