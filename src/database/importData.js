const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');

// The schema for the data
const GeneralSchema = new mongoose.Schema({
    question: String,
    options: {
        a: String,
        b: String,
        c: String,
        d: String
    },
    correct_answer: String,
    chatgpt: {
        answer: { type: String, default: "" },
        time_taken: { type: Number, default: null }
    }
});

// Get a Mongoose model for a specific collection
const getModelForCollection = (collectionName) => {
    return mongoose.model(collectionName, GeneralSchema, collectionName);
};

// Import data from a CSV file into a MongoDB collection
const importCSVToMongoDB = async (csvFilePath, collectionName) => {
    try {
        const Model = getModelForCollection(collectionName);

        const documentCount = await Model.countDocuments();
        if (documentCount > 0) {
            console.log(`[${new Date().toISOString()}] Data already exists in ${collectionName}. Skipping import.`);
            return;
        }
        
        const dataToInsert = [];

        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (row) => {
                    const formattedData = {
                        question: row['Question'],
                        options: {
                            a: row['Option A'],
                            b: row['Option B'],
                            c: row['Option C'],
                            d: row['Option D']
                        },
                        correct_answer: row['Correct Answer'],
                        chatgpt: {
                            answer: "",
                            time_taken: null
                        }
                    };
                    dataToInsert.push(formattedData);
                })
                .on('end', async () => {
                    console.log(`[${new Date().toISOString()}] Processing complete for ${collectionName}.`);
                    try {
                        await Model.insertMany(dataToInsert);
                        console.log(`[${new Date().toISOString()}] Data successfully inserted into ${collectionName}.`);
                        resolve();
                    } catch (error) {
                        console.error(`[${new Date().toISOString()}] Error inserting data into ${collectionName}:`, error);
                        reject(error);
                    }
                })
                .on('error', (error) => {
                    console.error(`[${new Date().toISOString()}] Error reading CSV file for ${collectionName}:`, error);
                    reject(error);
                });
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error importing data into ${collectionName}:`, error);
    }
};

module.exports = importCSVToMongoDB;
