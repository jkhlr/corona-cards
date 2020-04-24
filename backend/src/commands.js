import {Table} from "./table";
import {getInitialGameState, GAME_DEFINITIONS} from "./game";

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
}

class StartGame {
    constructor(gameId) {
        this.gameId = gameId;
    }

    apply() {
        return getInitialGameState(this.gameId)
    }

    isValid() {
        return this.gameId in GAME_DEFINITIONS
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
}

export {MoveCard, StartGame, FlipCard}


