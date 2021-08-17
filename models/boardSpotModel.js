class BoardSpot {
    constructor(index, count, isBlackOnTop, isBurnedSpot, isMoveable = false, isRemoveable = false) {
        this.index = index;
        this.count = count;
        this.isBlackOnTop = isBlackOnTop;
        this.isBurnedSpot = isBurnedSpot;
        this.isMoveable = isMoveable;
        this.isRemoveable = isRemoveable;
    }
}

module.exports = BoardSpot;