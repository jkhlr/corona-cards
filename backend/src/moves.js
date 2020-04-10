import {cloneState} from "./utils";

class MoveCards {
    constructor(cardIds, from, to, index) {
        this.cardIds = cardIds;
        this.from = from;
        this.to = to;
        this.index = index
    }

    apply(state) {
        const table = new Table(state.seats, state.slots);
        table.moveCards(this.cardIds, this.from, this.to, this.index);
        const newState = cloneState(state);
        for (let [i, seat] of table.seats.entries()) {
            newState.seats[i].cards = seat.cards
        }
        for (let [i, slot] of table.slots.entries()) {
            newState.slots[i].cards = slot.cards
        }
        return newState
    }

    isValid(state) {
        const table = new Table(state.seats, state.slots);
        return table.canMoveCards(this.cardIds, this.from, this.to, this.index);
    }

    serialize() {
        const cards = `card${this.cardIds.length > 1 ? 's' : ''} ${this.cardIds.join(', ')}`;
        const from = `${this.from.type}-${this.from.number}`;
        const to = `${this.to.type}-${this.to.number}`;
        return `Move ${cards} from ${from} to ${to}`
    }
}


class Table {
    constructor(seatState, slotState) {
        this.seats = seatState.map(seat => new Seat(seat.cards));
        this.slots = slotState.map(slot => new Slot(slot.cards, slot.maxCards));
    }

    canMoveCards(cardIds, {type: fromType, number: fromNumber}, {type: toType, number: toNumber}, index) {
        let from;
        if (fromType === 'seat') {
            if (fromNumber >= this.seats.length) {
                throw new TypeError(`Invalid from: ${fromType} ${fromNumber}`)
            }
            from = this.seats[fromNumber];
        } else if (fromType === 'slot') {
            if (fromNumber >= this.slots.length) {
                throw new TypeError(`Invalid from: ${fromType} ${fromNumber}`)
            }
            from = this.slots[fromNumber];
        } else {
            throw new TypeError(`Invalid fromType: ${fromType}`)
        }

        let to;
        if (toType === 'seat') {
            if (toNumber >= this.seats.length) {
                throw new TypeError(`Invalid to: ${toType} ${toNumber}`)
            }
            to = this.seats[toNumber]
        } else if (toType === 'slot') {
            if (toNumber >= this.slots.length) {
                throw new TypeError(`Invalid to: ${toType} ${toNumber}`)
            }
            to = this.slots[toNumber]
        } else {
            throw new TypeError(`Invalid toType: ${toType}`)
        }

        return from.canRemoveCards(cardIds) && to.canAddCardsAt(cardIds, index)
    }

    moveCards(cardIds, {type: fromType, number: fromNumber}, {type: toType, number: toNumber}, index) {
        let from;
        if (fromType === 'seat') {
            from = this.seats[fromNumber]
        } else if (fromType === 'slot') {
            from = this.slots[fromNumber]
        }
        let to;
        if (toType === 'seat') {
            to = this.seats[toNumber]
        } else if (toType === 'slot') {
            to = this.slots[toNumber]
        }
        const movingCards = from.removeCards(cardIds);
        to.addCardsAt(movingCards, index);
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
        if (index > this.cards.length) {
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
        if (index !== this.cards.length) {
            return false
        }
        return this.maxCards === null || this.cards.length + cards.length <= this.maxCards
    }
}

export {MoveCards}
