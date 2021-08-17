const online_users = [];

// A service that his purpose is to hold and communicate with the online_users array.
class SocketService {

    isUserExists = (username) => {
        return online_users.some(u => u.username === username);
    }

    getOnlineUser = (username) => {
        return online_users.find(u => u.username === username);
    }

    getOnlineUsers = () => {
        return online_users;
    }

    removeOnlineUser = (socketId) => {
        let index = online_users.findIndex(user => user.socketId === socketId);
        if (index != -1) {
            online_users.splice(index, 1);
        }
        return online_users;
    }

    addOnlineUser = (socketId, username) => {
        try {
            online_users.push({ socketId: socketId, username: username });
            console.log(online_users);
            return true;
        } catch (error) {
            console.log(error.message);
            return false;
        }
    }
}

module.exports = SocketService;