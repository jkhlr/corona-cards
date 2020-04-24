const NUMBERS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['D', 'H', 'S', 'C'];

const CARDS = {
    'SKAT': (() => {
        let i = 0;
        return SUITS.flatMap(
            suit => NUMBERS.slice(5).map(
                number => ({
                    face: number + suit,
                    id: i++,
                    flipped: false
                })
            )
        );
    })(),
    'POKER': (() => {
        let i = 0;
        return SUITS.flatMap(
            suit => NUMBERS.map(
                number => ({
                    face: number + suit,
                    id: i++,
                    flipped: false
                })
            )
        );
    })()
}

const GAME_DEFINITIONS = {
    'SKAT': {
        numSeats: 3,
        slotDescriptions: [
            {
                isOpen: false,
                maxCards: 2,
                canMove: 'all',
                canFlip: 'none',
                display: 'fan',
                name: 'Skat',
                initialCards: 2
            },
            {
                isOpen: true,
                maxCards: 3,
                canMove: 'last',
                canFlip: 'none',
                display: 'fan',
                name: 'Stich',
                initialCards: 0
            }
        ],
        cardType: 'SKAT',
        stash: 'closed',
    },
    'UNO': {
        numSeats: 4,
        slotDescriptions: [
            {
                isOpen: false,
                maxCards: null,
                canMove: 'last',
                canFlip: 'none',
                display: 'stack',
                name: 'draw',
                initialCards: 52
            },
            {
                isOpen: true,
                maxCards: null,
                canMove: 'last',
                canFlip: 'none',
                display: 'stack',
                name: 'next',
                initialCards: 0
            }
        ],
        cardType: 'POKER',
        stash: false
    }
}

function shuffled(arr) {
    const newArr = arr.slice()
    for (let i = newArr.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
    }
    return newArr
}

function getInitialGameState(gameId) {
    const {numSeats, slotDescriptions, cardType, stash} = GAME_DEFINITIONS[gameId]

    const cards = {}
    const cardDeck = shuffled(CARDS[cardType]);
    for (let [i, description] of slotDescriptions.entries()) {
        cards[`slot-${i}`] = cardDeck.splice(0, description.initialCards)
    }
    const remainingCards = cardDeck.length
    if (remainingCards % numSeats !== 0) {
        throw new TypeError(`Can't distribute ${remainingCards} cards evenly between ${numSeats} seats.`)
    }
    for (let i of Array(numSeats).keys()) {
        cards[`seat-${i}`] = cardDeck.splice(0, remainingCards / numSeats)
        if (stash === 'open' || stash === 'closed') {
            cards[`stash-${i}`] = []
        }
    }

    const config = {}
    for (let [i, description] of slotDescriptions.entries()) {
        config[`slot-${i}`] = {...description}
    }
    for (let i of Array(numSeats).keys()) {
        config[`seat-${i}`] = {isOpen: false, maxCards: null, canMove: 'all', canFlip: 'none'}
        if (stash === 'open') {
            config[`stash-${i}`] = {isOpen: true, maxCards: null, canMove: 'all', canFlip: 'none'}
        } else if (stash === 'closed') {
            config[`stash-${i}`] = {isOpen: false, maxCards: null, canMove: 'all', canFlip: 'all'}
        }
    }

    return {cards, config, gameId};
}

export {getInitialGameState, GAME_DEFINITIONS}
