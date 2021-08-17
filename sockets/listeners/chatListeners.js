const chatService = require('../../services/chatService');

class ChatListeners {
    constructor({ io, socket, service }) {
        this.io = io;
        this.socket = socket;
        this.service = service;
    }

    // Pulling the 
    onJoinChat = async (participants) => {
        try {
            const chat = await chatService.getChat(participants);
            if (chat) {
                this.socket.join(chat.chat_name);
                this.io.to(chat.chat_name).emit("joined_chat", chat);
            }
        } catch (error) {
            throw error;
        }
    }

    // Called when a new message is sent in the chat room, saves in DB and sends it to the other user.
    onSendMsg = (msgInfo) => {
        try {
            chatService.saveNewMessage(msgInfo);
            this.socket.to(msgInfo.chat_name).emit("receive_msg", msgInfo.content);
        } catch (error) {
            throw error;
        }
    }

}

module.exports = ChatListeners;