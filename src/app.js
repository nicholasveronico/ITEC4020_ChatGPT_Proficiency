const express = require('express');
const path = require('path');
const app = express();
const apiRoutes = require('./routes/apiRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const mongoose = require('mongoose');
const ensureMongoConnection = require('./database/ensureMongoConnection');

app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));

// Set the view engine to EJS
app.set('view engine', 'ejs');
// Set the views directory
app.set('views', path.join(__dirname, 'views')); 

// Middleware to log requests
app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${statusCode} - ${duration}ms`);
    });

    next();
});

// Middleware to implement CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');

    next();
});

// MongoDB middleware
const mongoMiddleware = async (req, res, next) => {
    let connection;
    try {
        connection = await ensureMongoConnection();
        req.mongoConnection = connection;
    } catch (error) {
        console.error(`[${new Date().toISOString()}] MongoDB middleware error:`, error);
        return res.status(500).json({ error: 'Database connection error' });
    }
    next();
};

// Use the API routes
app.use('/api', mongoMiddleware, apiRoutes);
app.use('/analysis', mongoMiddleware, analysisRoutes);

// Serve the index.ejs file at the root route
app.get('/', (req, res) => {
    res.render('home');
});

// Serve the about.ejs file at the /about route
app.get('/about', (req, res) => {
    res.render('about');
});

// Serve the analysis.ejs file at the /analysis route
app.get('/results', (req, res) => {
    res.render('results');
});

process.on('SIGINT', async () => {
    console.log(`[${new Date().toISOString()}] Closing MongoDB connection...`);
    await mongoose.disconnect();
    process.exit(0);
});

module.exports = app;