const GameService = require('../../services/gameService');

class GameListeners {

    constructor({ io, socket, service }) {
        this.io = io;
        this.socket = socket;
        this.socketService = service;
        this.gameService = new GameService();
        this.initBoard = this.gameService.initBoard();
        this.players = [];
        this.roomName = undefined;
        this.partner = undefined;
        this.isWhitePlayer = false;
    }

    // Send a game request to another player
    onRequestGame = (username, partnerName) => {
        try {
            const partner = this.socketService.getOnlineUser(partnerName);
            if (partner) {
                this.io.to(partner.socketId).emit("game_request", username);
            }
            else {
                this.socket.emit("game_request_failed", "The request failed, maybe the partner is offline?")
            }
        } catch (error) {
            this.socket.emit("server_error", error.message);
        }
    }

    // If the partner accepted the game request.
    onAcceptGame = (player, partnerName) => {
        try {
            // set the players's data for the game.
            this.partner = this.socketService.getOnlineUser(partnerName);
            this.players.push(
                { socketId: this.socket.id, username: player },
                this.partner
            );

            // Sorting the array so the roomName will be equal for both users.
            const sortedArray = this.players.sort();
            this.roomName = `${sortedArray[0].username}-${sortedArray[1].username}-game`;
            this.io.to(this.partner.socketId).to(this.socket.id).emit("game_accepted", this.roomName, this.players);
        } catch (error) {
            this.socket.emit("server_error", error.message);
        }
    }

    // If the partner declined the game request.
    onDeclineGame = (username, isBusy = false) => {
        try {
            const user = this.socketService.getOnlineUser(username);
            isBusy
                ? this.io.to(user.socketId).emit("game_request_failed", "The partner is currently busy.")
                : this.io.to(user.socketId).emit("game_request_failed", "The partner declined your offer.");
        } catch (error) {
            this.socket.emit("server_error", error.message);
        }
    }

    // When joining the game for the first time
    onJoinGame = (roomName) => {
        try {
            // re-setting the roomName because atm, only the one who accepted the request set his roomName.
            this.roomName = roomName;
            this.socket.join(this.roomName);
            this.io.to(this.roomName).emit("joined_game", this.initBoard);
        } catch (error) {
            this.socket.emit("server_error", error.message);
        }
    }

    // When each of the players rolling dices to see who'll be first.
    onRollTurn = (username) => {
        try {
            const roll = this.gameService.rollDice();
            const rollData = {
                result: roll,
                user: username
            };
            this.io.to(this.roomName).emit("turn_rolled", rollData);
        } catch (error) {
            this.socket.emit("server_error", error.message);
        }
    }

    // After both sides rolled their dices.
    onAllTurnsRolled = (rollsResults) => {
        try {
            let firstPlayer = rollsResults[0];
            let secondPlayer = rollsResults[1];
            let data = {
                board: this.initBoard
            }
            if (firstPlayer.roll[0] === secondPlayer.roll[0]) {
                this.io.emit("roll_again", "Tie, roll again!");
            } else {
                data.winner = firstPlayer.roll[0] > secondPlayer.roll[0] ? firstPlayer.username : secondPlayer.username;
                this.io.emit("game_start", data);
            }
        } catch (error) {
            this.socket.emit("server_error", error.message);
        }
    }

    // Setting the player's pieces color for the game.
    onPieceColor = (isWhitePlayer) => {
        this.isWhitePlayer = isWhitePlayer;
    }

    // Each time a player rolls the dices.
    onRollDices = () => {
        const rolls = this.gameService.rollDices();
        this.io.to(this.roomName).emit("dices_rolled", rolls);
    }

    // After the player finished it's turn.
    onEndTurn = () => {
        this.socket.to(this.roomName).emit("switch_turn");
    }

    // When choosing a spot to move a piece from.
    onSpotChosen = (spotIndex) => {
        this.socket.emit("chosen_spot", spotIndex);
    }

    // Calculating optional indexs to move from the chosen index.
    onCalcOptions = (data) => {
        try {
            let results = undefined;
            const isPieceRemoveable = this.gameService.checkPiecesRemoveable(data.board, this.isWhitePlayer);
            this.gameService.resetOldStates(data.board);

            if (isPieceRemoveable) {
                const [board] = this.gameService.calcOptionsEndGame(data, this.isWhitePlayer);
                results = {
                    board: board
                }
            } else {
                const [board, isBurnedNoOptions] = this.gameService.calcOptions(data, this.isWhitePlayer);
                results = {
                    board: board,
                    isBurnedNoOptions: isBurnedNoOptions
                }
            }
            this.socket.emit("show_options", results);
        } catch (error) {
            this.socket.emit("server_error", error.message);
        }
    }

    // When a piece is chosen it sends it's index to the board manager component.
    onTargetChosen = (targetIndex) => {
        this.socket.emit("chosen_target_spot", targetIndex);
    }

    // Move a piece from one spot to another, check if it can eat or be removed from the game, too.
    onMovePiece = (data) => {
        try {
            // If all pieces are inside the house && the player intends to 'burn' a piece.
            const isPieceRemoveable = this.gameService.checkPiecesRemoveable(data.board, this.isWhitePlayer);
            const result = isPieceRemoveable && data.start_index === data.target_index
                ? this.gameService.movePieceEndGame(data)
                : this.gameService.movePiece(data);

            const [rolls, board] = result;

            // check if player won
            const isGameOver = this.gameService.isGameOver(board, this.isWhitePlayer);

            if (isGameOver) {
                const winner = this.isWhitePlayer ? "white" : "black";
                const msg = `Game Over! The winner is ${winner}.`;
                const updatedData = {
                    rolls: rolls,
                    board: board,
                    message: msg
                }
                this.io.to(this.roomName).emit("game_over", updatedData);
            } else {
                const updatedData = {
                    rolls: rolls,
                    board: board
                }
                this.io.to(this.roomName).emit("piece_moved", updatedData);
            }
        } catch (error) {
            this.socket.emit("server_error", error.message);
        }
    }

    // Removing the player's socket from the room.
    onGameOver = () => {
        this.socket.leave(this.roomName);
    }
}

module.exports = GameListeners;