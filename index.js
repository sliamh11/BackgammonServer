const express = require('express');
require('dotenv').config();
const config = require('./config');
const authRoute = require('./routes/authentication');
const usersRoute = require('./routes/users');
const cors = require('cors');
const socketEvents = require('./sockets/index');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// Middlewares
require('./middlewares/dbConnect').connect();
app.use(express.json());
app.use(cors());
socketEvents(io);

// Routes
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);

server.listen(config.PORT, () => {
    console.log("Server is up on port", config.PORT);
})