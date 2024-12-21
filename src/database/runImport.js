const path = require('path');
const importCSVToMongoDB = require('./importData');
const config = require('../../config.json');
const mongoose = require('mongoose');

// Map CSV files to their respective collections
const spreadsheetsPath = path.resolve(__dirname, '../../spreadsheets');
const csvFiles = [
    { path: path.join(spreadsheetsPath, config.spreadsheets.computer_security), collection: 'Computer_Security' },
    { path: path.join(spreadsheetsPath, config.spreadsheets.history), collection: 'History' },
    { path: path.join(spreadsheetsPath, config.spreadsheets.social_science), collection: 'Social_Science' }
];

/**
 * Import all CSV files into MongoDB collections.
 * @returns {Promise} - Promise object representing the completion of the operation.
 */
const importAllCSVToMongoDB = async() => {
    try {
        for (const { path: filePath, collection } of csvFiles) {
            await importCSVToMongoDB(filePath, collection);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] An error occurred while importing data into MongoDB:`, error);
    } finally {
        mongoose.connection.close();
    }
}

module.exports = importAllCSVToMongoDB;
