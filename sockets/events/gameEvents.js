const GameListeners = require('../listeners/gameListeners');

const gameEvents = (initData) => {
    const listeners = new GameListeners(initData);
    const { socket } = initData;

    socket.on("request_game", listeners.onRequestGame); // When a user requests another user to play.
    socket.on("partner_accepted", listeners.onAcceptGame); // When the other user accepts.
    socket.on("partner_declined", listeners.onDeclineGame); // When the other user declines.
    socket.on("join_game", listeners.onJoinGame); // when first joining the game.
    socket.on("roll_turn", listeners.onRollTurn); // on a player's turn's roll.
    socket.on("all_turns_rolled", listeners.onAllTurnsRolled); // When both players rolled their turn-dices.
    socket.on("piece_color", listeners.onPieceColor); // Get the player's pieces colors.
    socket.on("roll_dices", listeners.onRollDices); // When clicking on the 'Roll' button.
    socket.on("spot_chosen", listeners.onSpotChosen); // When a user chooses to move a piece from this spot to another spot.
    socket.on("calc_options", listeners.onCalcOptions); // Calculate relevant options for the chosen spot.
    socket.on("target_spot_chosen", listeners.onTargetChosen); // when a player wants to move the chosen piece to the chosen target.
    socket.on("move_piece", listeners.onMovePiece); // After choosing the spot to move the piece to.
    socket.on("end_turn", listeners.onEndTurn); // At the end of each turn.
    socket.on("game_over",listeners.onGameOver); // At the end of the game.
}

module.exports = gameEvents;