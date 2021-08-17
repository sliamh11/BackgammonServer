const chatEvents = require('./events/chatEvents');
const gameEvents = require('./events/gameEvents');
const SocketService = require('../services/socketService');
const SocketListeners = require('./listeners/socketListeners');
const service = new SocketService();

const socketEvents = (io) => {
    
    // Connection
    io.on('connection', (socket) => {
        const initData = {
            io: io,
            socket: socket,
            service: service
        };
        const listeners = new SocketListeners(initData);
        
        // When first connected
        socket.on("user_connected", listeners.onConnected);

        chatEvents(initData);
        gameEvents(initData);

        // Disconnection
        socket.on('disconnect', listeners.onDisconnect);
    });
}

module.exports = socketEvents;