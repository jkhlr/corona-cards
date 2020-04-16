import {Table} from "./table";

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
        return {...gameState, cards}
    }

    isValid(gameState) {
        const table = new Table(gameState);
        return table.canMoveCard(this.cardId, this.fromSlug, this.toSlug, this.newIndex);
    }
}

export {MoveCard}


