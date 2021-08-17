const ChatListeners = require('../listeners/chatListeners');

const chatEvents = (initData) => {
    // Connection
    const listeners = new ChatListeners(initData);
    const { socket } = initData;

    socket.on("join_chat", listeners.onJoinChat); // Joining a room
    socket.on("send_msg", listeners.onSendMsg); // Sending a message
}

module.exports = chatEvents;