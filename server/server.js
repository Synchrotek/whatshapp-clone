const express = require('express');
const http = require('http')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const { connectToMongoDB } = require('./utils/connectDb.js');
const userSeeds = require('./seeders/user.seed.js');
const chatSeeds = require('./seeders/chat.seed.js');
require('dotenv').config();

const app = express();

// socket connectio setup -------------------------
const server = http.createServer(app);
const io = new Server(server, {});
// io.use((sokcet, next) => {});
const socketHandle = require('./lib/socketHandle.js');
socketHandle(io);

// middlewares -----------------------------------
app.use(express.json());
// app.use(express.urlencoded());
app.use(cookieParser())
app.use(cors());

// routes ----------------------------------------
const userRoutes = require('./routes/user.routes.js');
const chatRoutes = require('./routes/chat.routes.js');

app.get('/', (req, res) => {
    res.status(200).json({
        success: true, message: "Server is running"
    });
});
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);

// server start ----------------------------------
const PORT = process.env.PORT || 4500;
server.listen(PORT, () => {
    connectToMongoDB();
    // createUsers(10);
    // chatSeeds.createSampleSingleChats(10);
    // chatSeeds.createSampleGroupChats(10);
    // chatSeeds.creteMessagesInAChat("66d2d09da22c04d820237d06", 50);
    console.log(`Server running on PORT:${PORT}`);
}).on('error', (err) => {
    console.error('Server starting error:', err);
});