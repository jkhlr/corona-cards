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
        const cards = table.getCards();
        return {config: gameState.config, cards}
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

export {MoveCard, StartGame}


