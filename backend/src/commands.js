import {Table} from "./table";

class MoveCards {
    constructor(cardIds, fromSlug, toSlug, newIndex) {
        this.cardIds = cardIds;
        this.fromSlug = fromSlug;
        this.toSlug = toSlug;
        this.newIndex = newIndex
    }

    apply(gameState) {
        const table = new Table(gameState);
        table.moveCards(this.cardIds, this.fromSlug, this.toSlug, this.newIndex);
        const cards = table.getCards();
        return {...gameState, cards}
    }

    isValid(gameState) {
        const table = new Table(gameState);
        return table.canMoveCards(this.cardIds, this.fromSlug, this.toSlug, this.newIndex);
    }
}

export {MoveCards}


