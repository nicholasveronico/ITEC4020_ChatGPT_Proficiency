const express = require('express');
const { calculateAccuracy, analyzeTimeImpact, runAnalysis } = require('../services/analysisService.js');

const router = express.Router();

/**
 * @api {get} /accuracy/:collectionName Analyze time impact on accuracy
 * @apiName Accuracy
 * @apiGroup Analysis
 * 
 * @apiParam {String} collectionName The name of the collection to analyze
 * 
 * @apiSuccess {Object} accuracy Accuracy metrics
 * 
 * @apiError {String} error Error message
 * @apiError (500) {String} error "Failed to calculate accuracy."
 */
router.get('/accuracy/:collectionName', async (req, res) => {
    try {
        const { collectionName } = req.params;
        const accuracy = await calculateAccuracy(collectionName);
        res.status(200).json(accuracy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate accuracy.' });
    }
});

/**
 * @api {get} /summary Get analysis summary across all collections
 * @apiName GetAnalysisSummary
 * @apiGroup Analysis
 * 
 * @apiSuccess {Object} summary Analysis summary results
 * 
 * @apiError {String} error Error message
 * @apiError (500) {String} error "Failed to generate summary."
 */
router.get('/summary', async (req, res) => {
    try {
        const summary = await runAnalysis();
        res.status(200).json(summary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate summary.' });
    }
});

module.exports = router;
