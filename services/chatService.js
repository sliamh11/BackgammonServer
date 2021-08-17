const ChatModel = require('../models/chatModel');

class ChatService {

    getChat = async (names) => {
        try {
            let chat = await ChatModel.findOne({ participants: { $all: names } });
            // If room found
            if (chat) {
                return chat;
            }

            // If room wasn't found
            const sortedNames = names.sort();
            chat = await ChatModel.create({
                chat_name: sortedNames.join("-"),
                participants: sortedNames,
                history: new Array()
            });
            return chat;
        } catch (error) {
            throw error;
        }
    }

    saveNewMessage = async (msgInfo) => {
        try {
            // Find by chat_name, push the new message.
            await ChatModel.findOneAndUpdate({ chat_name: msgInfo.chat_name }, { $push: { history: msgInfo.content } });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ChatService();