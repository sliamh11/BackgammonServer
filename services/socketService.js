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
        const index = online_users.findIndex(user => user.socketId === socketId);
        if (index != -1) {
            online_users.splice(index, 1);
        }
        return online_users;
    }

    addOnlineUser = (socketId, username) => {
        online_users.push({ socketId: socketId, username: username });
    }
}

module.exports = SocketService;