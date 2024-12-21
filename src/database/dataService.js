const mongoose = require('mongoose');
const GeneralSchema = require('./importData').GeneralSchema;

/**
 * Get a Mongoose model for a specific collection
 * @param {String} collectionName - Name of the MongoDB collection.
 * @returns {Model} - Mongoose model for the collection.
 */
const getModelForCollection = (collectionName) => {
    return mongoose.model(collectionName, GeneralSchema, collectionName);
};

/**
 * Fetch all collections in the database.
 * @returns {Array} - List of collection names.
 */
const fetchCollections = async () => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    return collections.map(col => col.name);
}

/**
 * Fetch all questions from a specific collection.
 * @param {String} collectionName - Name of the MongoDB collection.
 * @returns {Array} - List of questions.
 */
const fetchAllQuestions = async (collectionName) => {
    const Model = getModelForCollection(collectionName);
    return await Model.find({});
}

/**
 * Fetch unanswered questions from the collection.
 * @param {String} collectionName - Name of the MongoDB collection.
 * @returns {Array} - List of unanswered questions.
 */
const fetchUnansweredQuestions = async (collectionName) => {
    const Model = getModelForCollection(collectionName);
    return await Model.find({ 'chatgpt.answer': "" });
};

/**
 * Fetch answered questions from the collection.
 * @param {String} collectionName - Name of the MongoDB collection.
 * @returns {Array} - List of answered questions.
 */
const fetchAnsweredQuestions = async (collectionName) => {
    const Model = getModelForCollection(collectionName);
    return await Model.find({ 'chatgpt.answer': { $ne: "" } });
};

/**
 * Save ChatGPT's answer for a question in the document.
 * @param {String} collectionName - Name of the MongoDB collection.
 * @param {String} questionId - ID of the question document.
 * @param {String} answer - ChatGPT's answer for the question.
 * @param {Number} questionTime - Time taken to answer the question.
 */
const saveChatGPTAnswer = async (collectionName, questionId, answer, questionTime) => {
    const Model = getModelForCollection(collectionName);
    await Model.findByIdAndUpdate(questionId, { chatgpt: { answer: answer, time_taken: questionTime } }
    );
};

/**
 * Clear all documents from a collection.
 * @param {String} collectionName - Name of the MongoDB collection.
 * @returns {Promise} - Promise that resolves when the collection is cleared.
 */
const clearCollection = async (collectionName) => {
    const Model = getModelForCollection(collectionName);
    await Model.deleteMany({});
};

module.exports = { getModelForCollection, fetchCollections, fetchAllQuestions, fetchUnansweredQuestions, fetchAnsweredQuestions, saveChatGPTAnswer, clearCollection };
