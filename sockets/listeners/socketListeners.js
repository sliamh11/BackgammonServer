
class SocketListeners {
    constructor({ io, socket, service }) {
        this.io = io;
        this.socket = socket;
        this.service = service;
    }

    onConnected = (user) => {
        try {
            if (!(this.service.isUserExists(user))) {
                this.service.addOnlineUser(this.socket.id, user);
            }
            const onlineUsers = this.service.getOnlineUsers();
            this.io.emit("online_users", onlineUsers);
        } catch (error) {
            this.socket.emit("server_error", error.message);
        }
    }

    onDisconnect = (reason) => {
        try {
            const updatedOnlineUsers = this.service.removeOnlineUser(this.socket.id)
            this.io.emit("online_users", updatedOnlineUsers);
        } catch (error) {
            this.socket.emit("server_error", error.message);
        }
    };
}

module.exports = SocketListeners;