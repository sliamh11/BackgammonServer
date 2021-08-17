
class SocketListeners{
    constructor({io, socket, service}) {
        this.io = io;
        this.socket = socket;
        this.service = service;
    }

    onConnected = (user) => {
        if (!(this.service.isUserExists(user))) {
            this.service.addOnlineUser(this.socket.id, user);
        }
        const onlineUsers = this.service.getOnlineUsers();
        this.io.emit("online_users", onlineUsers);
    }

    onDisconnect = (reason) => {
        const updatedOnlineUsers = this.service.removeOnlineUser(this.socket.id)
        this.io.emit("online_users", updatedOnlineUsers);
    };
}

module.exports = SocketListeners;