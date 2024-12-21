const express = require('express');
const mongoose = require('mongoose');
const { getChatGPTAnswer, getChatGPTResponse } = require('../api/chatgptService.js');
const { getModelForCollection, clearCollection, fetchUnansweredQuestions, fetchAllQuestions, fetchAnsweredQuestions, saveChatGPTAnswer } = require('../database/dataService.js');

const router = express.Router();

/**
 * @api {post} /collections Process question(s) and get ChatGPT's answer
 * @apiName ProcessQuestions
 * @apiGroup API
 * 
 * @apiParam {String} collectionName The name of the collection containing the question(s)
 * @apiParam {String} [id] The ID of the specific question document (required if process_all=false)
 * @apiParam {Boolean} [process_all=false] Whether to process all unanswered questions
 * 
 * @apiSuccess {Object} result Processing result
 * 
 * @apiError {String} error Error message
 */
router.post('/collections', async (req, res) => {
    const processAll = req.body.process_all === true || req.body.process_all === 'true'; // Default to false if not specified

    try {
        const { id, collectionName } = req.body;

        if (!collectionName) {
            return res.status(400).json({ error: 'Collection name is required' });
        }

        if (!processAll && !id) {
            return res.status(400).json({ error: 'Document ID is required when not processing all questions' });
        }

        // Fetch the question document by ID
        const Model = getModelForCollection(collectionName);

        if (processAll) {
            res.setTimeout(300000, () => {
                console.error(`[${new Date().toISOString()}] Request has timed out while processing all questions.`);
                res.status(500).json({ error: 'Request has timed out while processing all questions.' });
            });

            const questions = await fetchUnansweredQuestions(collectionName);

            if (!questions.length) {
                return res.status(200).json({
                    message: 'No unanswered questions found.',
                    questions: [],
                });
            }

            const answeredQuestions = [];
            const errors = [];

            // Process all questions
            await Promise.all(
                questions.map(async (question) => {
                    try {
                        const startTime = Date.now();
                        const chatgptAnswer = await getChatGPTAnswer(
                            question.question,
                            question.options.a,
                            question.options.b,
                            question.options.c,
                            question.options.d
                        );
                        const questionTime = Date.now() - startTime;

                        await saveChatGPTAnswer(collectionName, question._id, chatgptAnswer, questionTime);
                        const updatedDocument = await Model.findById(question._id);
                        answeredQuestions.push(updatedDocument);
                    } catch (error) {
                        console.error(`[${new Date().toISOString()}] Error processing question ${question._id}:`, error);
                        errors.push({
                            questionId: question._id,
                            error: error.message,
                        });
                    }
                })
            );

            // Send the response after all processing is complete
            return res.status(200).json({
                message: 'Questions processing completed',
                processed: answeredQuestions.length,
                total: questions.length,
                questions: answeredQuestions,
                errors: errors,
            });
        } else {
            const question = await Model.findById(id);

            if (!question) {
                return res.status(404).json({ error: 'Question not found.' });
            }

            // Check if the question has already been answered
            if (question.chatgpt.answer) {
                return res.status(200).json({ message: 'Question already processed.', question });
            }

            // Get ChatGPT's answer for the question
            const startTime = Date.now();
            const chatgptAnswer = await getChatGPTAnswer(
                question.question,
                question.options.a,
                question.options.b,
                question.options.c,
                question.options.d
            );
            const questionTime = Date.now() - startTime;

            // Save the answer to MongoDB
            await saveChatGPTAnswer(collectionName, id, chatgptAnswer, questionTime);

            // Fetch the updated document
            const updatedDocument = await Model.findById(id);

            return res.status(200).send({
                message: 'Question processed successfully.',
                question: updatedDocument,
            });
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error processing question:`, error);
        res.status(500).json({ error: 'An error occurred while processing the question.' });
    }
});

/**
 * @api {get} /collections Get all collections
 * @apiName GetCollections
 * @apiGroup API
 * 
 * @apiSuccess {Array} collections List of collection names.
 * 
 * @apiError {String} error Error message.
 * @apiError (500) {String} error "An error occurred while fetching collections."
 */
router.get('/collections', async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        res.json(collections.map(col => col.name));
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching collections:`, error);
        res.status(500).json({ error: 'An error occurred while fetching collections.' });
    }
});

/**
 * @api {get} /collections/:name Get documents in a collection
 * @apiName GetCollectionDocuments
 * @apiGroup API
 * 
 * @apiParam {String} name The name of the collection.
 * @apiParam {String} answered Filter by answered status (true, false).
 * 
 * @apiSuccess {Array} documents List of documents in the collection.
 * 
 * @apiError {String} error Error message.
 * @apiError (500) {String} error "An error occurred while fetching collection documents."
 */
router.get('/collections/:name', async (req, res) => {
    const { name } = req.params;
    const { answered } = req.query;

    try {
        if (!name) {
            return res.status(400).json({ error: 'Collection name is required.' });
        }

        const Model = getModelForCollection(name);

        let questions;
        if (answered === 'true') {
            questions = await fetchAnsweredQuestions(name);
        } else if (answered === 'false') {
            questions = await fetchUnansweredQuestions(name);
        } else {
            questions = await fetchAllQuestions(name);
        }

        res.json( { questions_fetched: questions.length, questions: questions});
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching questions from collection:`, error);
        res.status(500).json({ error: 'An error occurred while fetching collection documents.' });
    }
});

/**
 * @api {get} /collection/:name/question/:id Get specific question from collection
 * @apiName GetQuestionById
 * @apiGroup API
 * 
 * @apiParam {String} name Collection name
 * @apiParam {String} id Question ID
 * 
 * @apiSuccess {Object} question The requested question document
 * 
 * @apiError {String} error Error message
 * @apiError (400) {String} error "Collection name and question ID are required"
 * @apiError (404) {String} error "Question not found"
 * @apiError (500) {String} error "An error occurred while fetching the question"
 */
router.get('/collections/:name/question/:id', async (req, res) => {
    try {
        const { name, id } = req.params;

        if (!name || !id) {
            return res.status(400).json({ error: 'Collection name and question ID are required' });
        }

        const Model = getModelForCollection(name);
        const question = await Model.findById(id);

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.status(200).json(question);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching question:`, error);
        res.status(500).json({ error: 'An error occurred while fetching the question' });
    }
});

/**
 * @api {delete} /collections/:name Clear a collection
 * @apiName ClearCollection
 * @apiGroup API
 * 
 * @apiParam {String} name The name of the collection to clear.
 * 
 * @apiSuccess {String} message Success message
 * 
 * @apiError {String} error Error message
 * @apiError (400) {String} error "Collection name is required."
 * @apiError (500) {String} error "An error occurred while clearing the collection."
 */
router.delete('/collections/:name', async (req, res) => {
    const { name } = req.params;

    try {
        if (!name) {
            return res.status(400).json({ error: 'Collection name is required.' });
        }

        await clearCollection(name);
        res.status(200).json({ message: `Collection ${name} cleared successfully.` });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error clearing collection:`, error);
        res.status(500).json({ error: 'An error occurred while clearing the collection.' });
    }
});

module.exports = router;