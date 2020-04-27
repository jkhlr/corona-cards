export {initGame, GAME_DEFINITIONS}

const NUMBERS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['D', 'H', 'S', 'C'];

const CARDS = {
    skat: (() => {
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
    poker: (() => {
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
    skat: {
        name: 'Skat',
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
        cardType: 'skat',
        stashType: 'closed',
    },
    uno: {
        name: 'Uno',
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
        cardType: 'poker',
        stashType: 'none'
    }
}

function shuffled(array) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[rand]] = [newArray[rand], newArray[i]];
    }
    return newArray
}

function getGameConfig({id, name, numSeats, slotDescriptions, stashType}) {
    const config = {gameId: id, gameName: name}
    for (let [i, description] of slotDescriptions.entries()) {
        config[`slot-${i}`] = {...description}
    }
    for (let i of Array(numSeats).keys()) {
        config[`seat-${i}`] = {isOpen: false, maxCards: null, canMove: 'all', canFlip: 'none'}
        if (stashType === 'open') {
            config[`stash-${i}`] = {isOpen: true, maxCards: null, canMove: 'all', canFlip: 'none'}
        } else if (stashType === 'closed') {
            config[`stash-${i}`] = {isOpen: false, maxCards: null, canMove: 'all', canFlip: 'all'}
        }
    }
    return config
}

function getCardDistribution({cardType, numSeats, slotDescriptions, stashType}) {
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
        if (stashType === 'open' || stashType === 'closed') {
            cards[`stash-${i}`] = []
        }
    }
    return cards
}

function initGame(gameId) {
    const gameDefinition = GAME_DEFINITIONS[gameId]
    const config = getGameConfig({id: gameId, ...gameDefinition})
    const cards = getCardDistribution(gameDefinition)
    return {cards, config};
}
