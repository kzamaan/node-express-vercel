// Import packages
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const routes = require('./routes');
const { socketConnection } = require('./controllers/socket.controller');
const { errorHandler, requestHandler } = require('./middleware/errorHandler');
const { errorLogger, infoLogger, logger } = require('./utilities/logger');

// mongoose connection
try {
    mongoose.connect(process.env.MONGO_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    console.log('Connected to MongoDB...');
} catch (error) {
    console.log(error);
}

// Middleware
const app = express();
app.use(express.json());
const server = http.createServer(app);

// request handler
app.use(infoLogger);
app.use(requestHandler);

// add socket.io
const io = socketIo(server, {
    cors: {
        origin: '*', // process.env.CLIENT_URL,
        methods: ['GET', 'POST']
    }
});

global.io = io;

// set cors
app.use(cors({ credentials: true, origin: true }));
app.set('trust proxy');

// parse cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

const chat = io.of('/chat');
chat.on('connection', socketConnection);

// Routes
app.use('/', routes);

// error logger
app.use(errorLogger);
// error handler
app.use(errorHandler);
// connection
const port = process.env.PORT || 9001;
server.listen(port, () => logger.info(`Listening to port http://localhost:${port}`));
