const ChatModel = require('../models/chatModel');

class ChatService {

    getChat = async (names) => {
        try {
            // Sort names so they'll be in the same order, for everyone.
            const sortedNames = names.sort();
            const chat = await ChatModel.findOneAndUpdate(
                { // Look for a document where all of the participants exist in 'names' array.
                    participants: {
                        $all: [
                            { "$elemMatch": { "$eq": names[0] } },
                            { "$elemMatch": { "$eq": names[1] } }
                        ]
                    }
                },
                { // Only when document not found - insert the following data
                    $setOnInsert: {
                        chat_name: sortedNames.join("-"),
                        participants: sortedNames,
                        history: new Array()
                    }
                },
                // Return the new, updated document (either the found one / new one).
                { upsert: true, new: true }
            )
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