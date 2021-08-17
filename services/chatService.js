const ChatModel = require('../models/chatModel');

class ChatService {

    getChat = async (names) => {
        try {
            const sortedNames = names.sort();
            const chat = await ChatModel.findOneAndUpdate(
                { participants: { $all: names } },
                {
                    $setOnInsert: {
                        chat_name: sortedNames.join("-"),
                        participants: sortedNames,
                        history: new Array()
                    }
                },
                { upsert: true, returnDocument: true },
            )
            return chat;
            // let chat = await ChatModel.findOne({ participants: { $all: names } });
            // // If room found
            // if (chat) {
            //     return chat;
            // }

            // // If room wasn't found
            // chat = await ChatModel.create({
            //     chat_name: sortedNames.join("-"),
            //     participants: sortedNames,
            //     history: new Array()
            // });
            // return chat;
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