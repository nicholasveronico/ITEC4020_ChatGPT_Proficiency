const mongoose = require('mongoose');
const config = require('../../config.json');

const ensureMongoConnection = async () => {
    try {
        // Check the connection state
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        // If not connected, establish the connection
        if (mongoose.connection.readyState === 0) {
            console.log(`[${new Date().toISOString()}] MongoDB is not connected. Connecting now...`);
            const connection = await mongoose.connect(config.mongodb.url);
            console.log(`[${new Date().toISOString()}] MongoDB connection established.`);
            return connection;
        } else {
            console.log(`[${new Date().toISOString()}] MongoDB connection is in progress. Please wait.`);
            return new Promise((resolve, reject) => {
                mongoose.connection.on('connected', () => {
                    console.log(`[${new Date().toISOString()}] MongoDB connection established.`);
                    resolve(mongoose.connection);
                });
                mongoose.connection.on('error', (error) => {
                    console.error(`[${new Date().toISOString()}] Error establishing MongoDB connection:`, error);
                    reject(error);
                });
            });
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error ensuring MongoDB connection:`, error);
        throw error;
    }
};

module.exports = ensureMongoConnection;
