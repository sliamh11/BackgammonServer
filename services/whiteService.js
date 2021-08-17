class WhiteService {

    // Calculate options for mid-game 
    calcOptions = (chosen_index, rolls, board) => {
        const moveableOptions = [];
        rolls.forEach((value) => {
            let targetIndex = chosen_index + value;
            // +1 if the piece crosses one of the middle indexs - skip it.
            if (this.isCrossingMiddle(chosen_index, targetIndex)) {
                targetIndex += 1;
            }

            // Check if the target index is a valid position.
            const isValidOption =
                // targetIndex is between boundries
                targetIndex < board.length
                &&
                // chosen & target indexs are white
                ((!board[targetIndex].isBlackOnTop)
                    ||
                    // target is black but have 1 or less pieces in it.
                    (board[targetIndex].isBlackOnTop && board[targetIndex].count <= 1));

            if (isValidOption) {
                moveableOptions.push(targetIndex);
            }
        });
        return moveableOptions;
    }

    // Check if a piece can be removed with the exact value of one of the rolls.
    isExactRemoveable = (chosen_index, rolls, board) => {
        return rolls.find(value => chosen_index + value === board.length) ? true : false;
    }

    // Calculate options for the end game (allows removal of game pieces)
    calcOptionsEndGame = (chosen_index, rolls, board) => {
        const moveableOptions = [];
        let farthestPieceIndex = undefined;

        // Search for the farthest piece in the house.
        for (let index = 20; index < board.length; index++) {
            const elem = board[index];
            if (!elem.isBlackOnTop && elem.count > 0) {
                farthestPieceIndex = index;
                break;
            }
        }

        rolls.forEach(roll => {
            let targetIndex = chosen_index + roll;
            // Check if can remove the chosen piece (for example, the farthest piece is in index 21/25 and the player rolled a 6).
            if (chosen_index === farthestPieceIndex && targetIndex >= board.length) {
                board[chosen_index].isRemoveable = true;
                // else if piece is moveable.
            } else if (targetIndex < board.length
                && ((!board[targetIndex].isBlackOnTop)
                    || (board[targetIndex].isBlackOnTop && board[targetIndex].count <= 1))) {
                moveableOptions.push(targetIndex);
            }
        });
        return moveableOptions;
    }

    // Check if the intended move is crossing the middle spots.
    isCrossingMiddle = (start_index, target_index) => {
        return (start_index < 6 && target_index >= 6) || (start_index < 19 && target_index >= 19);
    }

    // Search for pieces in all of the spots outside the white's house
    checkPiecesRemoveable = (board) => {
        for (let index = 0; index < 20; index++) {
            const elem = board[index];
            if (!elem.isBlackOnTop && elem.count > 0) {
                return false;
            }
        }
        return true;
    }

    // Check if all of the white pieces were removed from the board.
    isWon = (board) => {
        for (const item of board) {
            if (!item.isBlackOnTop && item.count > 0) {
                return false;
            }
        }
        return true;
    }
}

module.exports = new WhiteService();