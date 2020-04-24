class Table {
    constructor(gameState) {
        this.cardContainers = Object.fromEntries(
            Object.keys(gameState.cards).map(
                (key) =>
                    [key, new CardContainer(gameState.cards[key], gameState.config[key])]
            )
        );
    }

    canMoveCard(cardId, fromSlug, toSlug, index) {
        const from = this.cardContainers[fromSlug];
        const to = this.cardContainers[toSlug];
        return from.canRemoveCard(cardId) && to.canAddCardAt(index)
    }

    moveCard(cardId, fromSlug, toSlug, index) {
        const from = this.cardContainers[fromSlug];
        const to = this.cardContainers[toSlug];
        const movingCard = from.removeCard(cardId);
        to.addCardAt(movingCard, index);
    }

    canFlipCard(cardId, containerSlug) {
        const container = this.cardContainers[containerSlug];
        return container.canFlipCard(cardId);
    }

    flipCard(cardId, containerSlug) {
        const container = this.cardContainers[containerSlug];
        return container.flipCard(cardId);
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

class CardContainer {
    constructor(cards, config) {
        this.cards = cards;
        this.config = config;
    }

    get cardIdMap() {
        return new Map(this.cards.map(card => [card.id, card]));
    }

    get indexIdMap() {
        let i = 0;
        return new Map(this.cards.map((card) => [card.id, i++]));
    }

    removeCard(cardId) {
        const movingCard = this.cardIdMap.get(cardId);
        this.cards = this.cards.filter(card => card.id !== cardId);
        return movingCard
    }

    addCardAt(card, index) {
        if (index === null || index > this.cards.length) {
            index = this.cards.length
        }
        if (index < 0) {
            index = 0
        }
        this.cards = this.cards.slice(0, index).concat([card]).concat(this.cards.slice(index));
    }

    flipCard(cardId) {
        const card = this.cardIdMap.get(cardId)
        card.flipped = !card.flipped
    }

    canRemoveCard(cardId) {
        if (this.config.canMove === 'all') {
            return this.cardIdMap.has(cardId)
        }
        if (this.config.canMove === 'last') {
            return this.indexIdMap.get(cardId) === this.cards.length - 1
        }
        return false
    }

    canAddCardAt(index) {
        if (index === null || index > this.cards.length) {
            index = this.cards.length
        }
        if (index < 0) {
            index = 0
        }
        if (this.config.canMove === 'last' && index !== this.cards.length) {
            return false
        }
        if (this.config.canMove !== 'last' && this.config.canMove !== 'all') {
            return false
        }
        return this.config.maxCards === null || this.cards.length < this.config.maxCards
    }

    canFlipCard(cardId) {
        if (this.config.canFlip === 'all') {
            return this.cardIdMap.has(cardId)
        }
        if (this.config.canFlip === 'last') {
            return this.indexIdMap.get(cardId) === this.cards.length - 1
        }
        return false
    }
}

export {Table}
