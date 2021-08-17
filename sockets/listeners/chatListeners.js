const chatService = require('../../services/chatService');

class ChatListeners {
    constructor({ io, socket, service }) {
        this.io = io;
        this.socket = socket;
        this.service = service;
    }

    // Pulling the chat history, if exists.
    onJoinChat = async (participants) => {
        try {
            const chat = await chatService.getChat(participants);
            if (chat) {
                this.socket.join(chat.chat_name);
                this.io.to(chat.chat_name).emit("joined_chat", chat);
            }
        } catch (error) {
            this.socket.emit("server_error",error.message);
        }
    }

    // Called when a new message is sent in the chat room, saves in DB and sends it to the other user.
    onSendMsg = (msgInfo) => {
        try {
            chatService.saveNewMessage(msgInfo);
            this.socket.to(msgInfo.chat_name).emit("receive_msg", msgInfo.content);
        } catch (error) {
            this.socket.emit("server_error",error.message);
        }
    }

}

module.exports = ChatListeners;