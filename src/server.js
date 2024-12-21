const config = require('../config');
const app = require('./app');
const connectToDatabase = require('./database/database');

// Conenct to the database
connectToDatabase();

const port = config.web.port;
app.listen(port, () => {
    console.log(`[${new Date().toISOString()}] Server running on https://itec4020.itzflip.ca`);
});
