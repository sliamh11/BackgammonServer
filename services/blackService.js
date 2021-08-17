class BlackService {

    // Check if a piece can be removed with the exact value of one of the rolls.
    isExactRemoveable = (chosen_index, rolls) => {
        return rolls.find(value => chosen_index - value === -1) ? true : false;
    }

    // Calculate options for mid-game.
    calcOptions = (chosen_index, rolls, board) => {
        try {
            const moveableOptions = [];
            rolls.forEach((value) => {
                let targetIndex = chosen_index - value;
                // check if the start and end indexs cross a middle spot - skip it.
                if (this.isCrossingMiddle(chosen_index, targetIndex)) {
                    targetIndex -= 1;
                }

                // Check if the target index is a valid position.
                const isValidOption =
                    // target is between boundries
                    targetIndex >= 0
                    &&
                    // Target is black
                    ((board[targetIndex].isBlackOnTop)
                        ||
                        // Target is white but has only 1 piece on it / is empty.
                        (!board[targetIndex].isBlackOnTop && board[targetIndex].count <= 1));

                if (isValidOption) {
                    moveableOptions.push(targetIndex);
                }
            });
            return moveableOptions;
        } catch (error) {
            throw error;
        }
    }

    // Calculate options for the end game (allows removal of game pieces)
    calcOptionsEndGame = (chosen_index, rolls, board) => {
        try {
            // Search for the farthest piece in the house.
            const moveableOptions = [];
            let farthestPieceIndex = undefined;

            // Search for the farthest piece in the house. 
            for (let index = 5; index >= 0; index--) {
                const elem = board[index];
                if (elem.isBlackOnTop && elem.count > 0) {
                    farthestPieceIndex = index;
                    break;
                }
            }

            rolls.forEach(roll => {
                let targetIndex = chosen_index - roll;
                // Check if can remove the chosen piece (for example, the farthest piece is in index 4 and the player rolled a 6).
                if (chosen_index === farthestPieceIndex && targetIndex < 0) {
                    board[chosen_index].isRemoveable = true;
                    // else if piece is moveable.
                } else if (targetIndex >= 0 &&
                    ((board[targetIndex].isBlackOnTop)
                        || (!board[targetIndex].isBlackOnTop && board[targetIndex].count <= 1))) {
                    moveableOptions.push(targetIndex);
                }
            });
            return moveableOptions;
        } catch (error) {
            throw error;
        }
    }

    // Check if the intended move is crossing the middle spots.
    isCrossingMiddle = (start_index, target_index) => {
        return (start_index > 19 && target_index <= 19) || (start_index > 6 && target_index <= 6)
    }

    // Search for pieces in all of the spots outside the black's house
    checkPiecesRemoveable = (board) => {
        try {
            for (let index = board.length - 1; index > 5; index--) {
                const elem = board[index];
                if (elem.isBlackOnTop && elem.count > 0) {
                    return false;
                }
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Check if all of the black pieces were removed from the board.
    isWon = (board) => {
        try {
            for (const item of board) {
                if (item.isBlackOnTop && item.count > 0) {
                    return false;
                }
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new BlackService();