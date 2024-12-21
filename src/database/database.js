const importAllCSVToMongoDB = require('./runImport');
const ensureMongoConnection = require('./ensureMongoConnection');

/**
 * Ensure that the required collections exist in the MongoDB database.
 * @param {MongoClient} db - MongoDB database connection.
 * @returns {Promise} - Promise object representing the completion of the operation.
 */
const ensureCollections = async (db) => {
    const existingCollections = await db.listCollections().toArray();
    const collectionNames = existingCollections.map((col) => col.name);

    const collectionsToCreate = ['Computer_Security', 'History', 'Social_Science'];

    for (const collection of collectionsToCreate) {
        if (!collectionNames.includes(collection)) {
            await db.createCollection(collection);
            console.log(`[${new Date().toISOString()}] Created collection: ${collection}`);
        } else {
            console.log(`[${new Date().toISOString()}] Collection already exists: ${collection}`);
        }
    }
};

/**
 * Connect to the MongoDB database and ensure that the required collections exist.
 * Import all CSV files into MongoDB.
 * @returns {Promise} - Promise object representing the completion of the operation.
 * @throws {Error} - If an error occurs while connecting to MongoDB.
 */
const connectToDatabase = async () => {
    try {
        const connection = await ensureMongoConnection();

        const db = connection.connection.db;
        await ensureCollections(db);
        await importAllCSVToMongoDB();
    } catch (error) {
        console.error(`[${new Date().toISOString()}] An error has occurred while connecting to MongoDB: ` + error);
        process.exit(1);
    }
};

module.exports = connectToDatabase;