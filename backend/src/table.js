class Table {
    constructor(gameState) {
        this.cardContainers = Object.fromEntries(
            Object.keys(gameState.config).map(
                (key) => {
                    if (key.startsWith('seat-')) {
                        return [key, new Seat(gameState.cards[key])]
                    } else if (key.startsWith('slot-')) {
                        return [key, new Slot(gameState.cards[key], gameState.config[key].maxCards)]
                    } else {
                        throw TypeError(`Invalid key: ${key}`)
                    }
                }
            )
        );
    }

    canMoveCards(cardIds, fromSlug, toSlug, index) {
        const from = this.cardContainers[fromSlug];
        const to = this.cardContainers[toSlug];
        return from.canRemoveCards(cardIds) && to.canAddCardsAt(cardIds, index)
    }

    moveCards(cardIds, fromSlug, toSlug, index) {
        const from = this.cardContainers[fromSlug];
        const to = this.cardContainers[toSlug];
        const movingCards = from.removeCards(cardIds);
        to.addCardsAt(movingCards, index);
    }

    getCards() {
        return Object.fromEntries(
            Object.entries(this.cardContainers).map(
                ([key, cardContainer]) =>
                    [key, cardContainer.cards]
            )
        );
    }
}

class AbstractCardContainer {
    constructor(cards) {
        this.cards = cards;
        this.cardIdMap = new Map(cards.map(card => [card.id, card]));
    }

    removeCards(cardIds) {
        const movingCards = cardIds.map(id => this.cardIdMap.get(id));
        this.cards = this.cards.filter(card => !cardIds.includes(card.id));
        return movingCards
    }

    addCardsAt(cards, index) {
        if (index === null || index > this.cards.length) {
            index = this.cards.length
        }
        if (index < 0) {
            index = 0
        }
        this.cards = this.cards.slice(0, index).concat(cards).concat(this.cards.slice(index));
    }
}

// A seat is a collection of cards, where cards can be removed and added everywhere.
// It has no maximum capacity.
// Can be used for a players hand
class Seat extends AbstractCardContainer {
    canRemoveCards(cardIds) {
        return cardIds.every(cardId => this.cardIdMap.has(cardId))
    }

    canAddCardsAt() {
        return true
    }
}

// A slot behaves like a seat, but cards can only be added and removed at the end.
// It can also have a maximum capacity.
// Can be used as a stack, with non-top cards visible or hidden.
class Slot extends AbstractCardContainer {
    constructor(cards, maxCards) {
        super(cards);
        this.maxCards = maxCards;
    }

    canRemoveCards(cardIds) {
        if (cardIds.length > this.cards.length) {
            return false
        }
        const candidateCardIds = this.cards.slice(this.cards.length - cardIds.length).map(card => card.id);
        return cardIds.every(cardId => candidateCardIds.includes(cardId));
    }

    canAddCardsAt(cards, index) {
        if (index === null || index > this.cards.length) {
            index = this.cards.length
        }
        if (index < 0) {
            index = 0
        }
        if (index !== this.cards.length) {
            return false
        }
        return this.maxCards === null || this.cards.length + cards.length <= this.maxCards
    }
}

export {Table}
