import {Table} from "./table";
import {initGame, GAME_DEFINITIONS} from "./game";

class MoveCard {
    constructor(cardId, fromSlug, toSlug, newIndex) {
        this.cardId = cardId;
        this.fromSlug = fromSlug;
        this.toSlug = toSlug;
        this.newIndex = newIndex
    }

    apply(gameState) {
        const table = new Table(gameState);
        table.moveCard(this.cardId, this.fromSlug, this.toSlug, this.newIndex);
        return {...gameState, cards: table.getCards()}
    }

    isValid(gameState) {
        const table = new Table(gameState);
        return table.canMoveCard(this.cardId, this.fromSlug, this.toSlug, this.newIndex);
    }

    serialize() {
        return {
            command: 'move',
            args: {
                cardId: this.cardId,
                fromSlug: this.fromSlug,
                toSlug: this.toSlug,
                newIndex: this.newIndex
            }
        }
    }
}

class StartGame {
    constructor(gameId) {
        this.gameId = gameId;
    }

    apply() {
        return initGame(this.gameId)
    }

    isValid() {
        return this.gameId in GAME_DEFINITIONS
    }

    serialize() {
        return {
            command: 'start',
            args: {
                cardId: this.gameId,
            }
        }
    }
}

class FlipCard {
    constructor(cardId, containerSlug) {
        this.cardId = cardId;
        this.containerSlug = containerSlug
    }

    apply(gameState) {
        const table = new Table(gameState);
        table.flipCard(this.cardId, this.containerSlug);
        return {...gameState, cards: table.getCards()}
    }

    isValid(gameState) {
        const table = new Table(gameState);
        return table.canFlipCard(this.cardId, this.containerSlug);
    }

    serialize() {
        return {
            command: 'flip',
            args: {
                cardId: this.cardId,
                containerSlug: this.containerSlug
            }
        }
    }
}

export {MoveCard, StartGame, FlipCard}


