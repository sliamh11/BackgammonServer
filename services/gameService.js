const GameSpot = require('../models/boardSpotModel');
const blackService = require('../services/blackService');
const whiteService = require('../services/whiteService');

class GameService {

    // Holds the initial state of the board.
    initBoard = () => {
        const board = [
            // Top-Right
            new GameSpot(0, 2, false, false), new GameSpot(1, 0, false, false), new GameSpot(2, 0, false, false),
            new GameSpot(3, 0, false, false), new GameSpot(4, 0, false, false), new GameSpot(5, 5, true, false),
            // Top-Middle
            new GameSpot(6, 0, false, true), // white burned pieces
            // Top-Left
            new GameSpot(7, 0, false, false), new GameSpot(8, 3, true, false), new GameSpot(9, 0, false, false),
            new GameSpot(10, 0, false, false), new GameSpot(11, 0, false, false), new GameSpot(12, 5, false, false),
            // Bottom-Left
            new GameSpot(13, 5, true, false), new GameSpot(14, 0, false, false), new GameSpot(15, 0, false, false),
            new GameSpot(16, 0, false, false), new GameSpot(17, 3, false, false), new GameSpot(18, 0, false, false),
            // Bottom-Middle
            new GameSpot(19, 0, true, true), // black burned pieces
            // Bottom-Right
            new GameSpot(20, 5, false, false), new GameSpot(21, 0, false, false), new GameSpot(22, 0, false, false),
            new GameSpot(23, 0, false, false), new GameSpot(24, 0, false, false), new GameSpot(25, 2, true, false)
        ];
        return board;
    }
    
    rollDice = () => {
        return Math.floor(Math.random() * 6 + 1);
    }

    rollDices = () => {
        const firstDice = this.rollDice();
        const secondDice = this.rollDice();

        // If the user got a double
        if (firstDice === secondDice) {
            return [firstDice, secondDice, firstDice, secondDice];
        }
        return [firstDice, secondDice];
    }

    // Manages the whole 'moving a piece' phase.
    movePiece = (data) => {
        const isBlackPlayer = data.board[data.start_index].isBlackOnTop;
        const isBurnedPiece = data.start_index === 6 || data.start_index === 19;

        if (this.checkCanEat(data)) {
            this.moveAndEatPiece(data);
        }
        else {
            this.movePieceToTarget(data);
        }

        // If burned - set start_index to the relevant spot
        if (isBurnedPiece) {
            data.start_index = isBlackPlayer ? data.board.length : -1;
        }

        // Math.abs so it wont matter if its the white / black player.
        let roll = Math.abs(data.target_index - data.start_index);

        // If the roll moved a piece from one side to another (middle counts as a spot, therefor adds +1 to the result of 'roll');
        if (isBlackPlayer) {
            if (blackService.isCrossingMiddle(data.start_index, data.target_index)) {
                roll -= 1;
            }
        } else {
            if (whiteService.isCrossingMiddle(data.start_index, data.target_index)) {
                roll -= 1;
            }
        }

        // Remove the roll from the rolls array.
        data.rolls.splice(data.rolls.indexOf(roll), 1);

        // Set the moveable targets
        data.board.forEach((value) => {
            value.isMoveable = false;
        });

        // Reset isRemoveable & isMoveable
        this.resetOldStates(data.board);

        return [data.rolls, data.board];
    }

    // Move and / or burn a piece from the board.
    movePieceEndGame = ({ target_index, rolls, board }) => {
        // target_index === chosen index, the one to remove.
        const isBlackPlayer = board[target_index].isBlackOnTop;

        // get the roll value
        // Note: since its a removeable spot, its safe to assume that the roll is either == index or above it.
        let rollValue = isBlackPlayer
            ? target_index + 1
            : board.length - target_index;

        // If specific roll value wasn't found - look for the closest one above.
        if (rolls.indexOf(rollValue) === -1) {
            for (let val = rollValue + 1; val <= 6; val++) {
                const closestRollIndex = rolls.indexOf(val);
                if (closestRollIndex !== -1) {
                    rollValue = val;
                    break;
                }
            }
        }

        // Update board and rolls array
        board[target_index].count -= 1;
        rolls.splice(rolls.indexOf(rollValue), 1);

        // Reset isRemoveable & isMoveable
        this.resetOldStates(board);

        return [rolls, board];
    }

    // Calculate the mid-game movement options
    calcOptions = ({ chosen_index, rolls, board }) => {
        let validOptions = []
        const isPlayerBlack = board[chosen_index].isBlackOnTop;
        const isBurnedPiece = chosen_index === 6 || chosen_index === 19;

        // If the chosen piece is a burned one
        if (isBurnedPiece) {
            chosen_index = isPlayerBlack ? board.length : -1;
        }

        validOptions = isPlayerBlack
            ? blackService.calcOptions(chosen_index, rolls, board)
            : whiteService.calcOptions(chosen_index, rolls, board);

        // If the chosen spot isn't a burned piece AND there are options to move
        const optionsExist = validOptions.length > 0;
        if (optionsExist) {
            validOptions.forEach(index => {
                board[index].isMoveable = true;
            });
        }

        const isBurnedNoOptions = !optionsExist && isBurnedPiece;

        return [board, isBurnedNoOptions];
    }

    // Calculate the end-game options (move / burn)
    calcOptionsEndGame = ({ chosen_index, rolls, board }) => {
        let validOptions = [];
        const isBlackPlayer = board[chosen_index].isBlackOnTop;

        // Check if chosen_index can be removed with the *exact* value of one of the rolls.
        board[chosen_index].isRemoveable = isBlackPlayer
            ? blackService.isExactRemoveable(chosen_index, rolls)
            : whiteService.isExactRemoveable(chosen_index, rolls, board);

        // Search for optional targets to move to.
        validOptions = isBlackPlayer
            ? blackService.calcOptionsEndGame(chosen_index, rolls, board)
            : whiteService.calcOptionsEndGame(chosen_index, rolls, board);

        // Set the moveable indexs.
        validOptions.forEach((index) => {
            board[index].isMoveable = true;
        });

        return [board];
    }

    // Check if the piece in the target_index is eatable.
    checkCanEat = ({ start_index, target_index, board }) => {
        const isPlayerBlack = board[start_index].isBlackOnTop;
        const isTargetBlack = board[target_index].isBlackOnTop;
        const hasTargets = board[target_index].count > 0;

        return (isPlayerBlack !== isTargetBlack && hasTargets);
    }

    // Move a piece to the target_index
    movePieceToTarget = ({ start_index, target_index, board }) => {
        // Move from start to target
        const isPlayerBlack = board[start_index].isBlackOnTop;
        board[start_index].count -= 1;
        board[target_index].count += 1;

        // Update new spot's color 
        board[target_index].isBlackOnTop = isPlayerBlack;
    }

    // Move a piece and eat the piece in the target_index
    moveAndEatPiece = ({ start_index, target_index, board }) => {
        const isTargetBlack = board[target_index].isBlackOnTop;
        board[start_index].count -= 1;
        board[target_index].isBlackOnTop = !isTargetBlack;

        // after target is eaten, move it to it's burned spot.
        isTargetBlack ? board[19].count += 1 : board[6].count += 1;
    }

    // Check if there are any pieces left outside the color's house.
    checkPiecesRemoveable = (board, isWhitePlayer) => {
        // If white player, i want to check spots 0-19, else 25-6
        return isWhitePlayer
            ? whiteService.checkPiecesRemoveable(board)
            : blackService.checkPiecesRemoveable(board);
    }

    // Check if any of the sides reached 0 pieces in the board.
    isGameOver = (board, isWhitePlayer) => {
        return isWhitePlayer
            ? whiteService.isWon(board)
            : blackService.isWon(board);
    }

    // Reset board's isMoveables && isRemoveable.
    resetOldStates = (board) => {
        board.forEach(item => {
            item.isMoveable = false;
            item.isRemoveable = false;
        });
    }
}

module.exports = GameService;