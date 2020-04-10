import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import {MoveCards} from "./moves";
import {cloneState, ValidationError} from "./utils";

const app = express();
const server = http.createServer(app);
const io = socketio(server, {path: '/ws/socket.io'});

function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const NUMBERS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['D', 'H', 'S', 'C'];

const POKER_CARDS = () => {
    let i = 0;
    return SUITS.flatMap(suit => NUMBERS.map(number => ({face: number + suit, id: i++})));
};
const SKAT_CARDS = () => {
    let i = 0;
    return SUITS.flatMap(suit => NUMBERS.slice(5).map(number => ({face: number + suit, id: i++})));
};

const SKAT_GAME = () => {
    return getInitialGameState(
        3,
        [
            {type: 'closed', maxCards: null},
            {type: 'open', maxCards: null}
        ],
        'skat',
        false
    );
};

const TEST_GAME = () => {
    const cards = SKAT_CARDS();
    const seats = [
        {
            cards: []
        },
        {
            cards: []
        },
        {
            cards: []
        },
        {
            cards: []
        }
    ];
    const slots = [
        {
            type: 'closed',
            maxCards: null,
            cards: cards
        },
        {
            type: 'open',
            maxCards: null,
            cards: []
        }
    ];
    return {seats, slots};
};


function getInitialGameState(numSeats, slotDescriptions, cardType, shuffle) {
    const seats = Array(numSeats).fill(null).map(() => ({cards: []}));
    const slots = slotDescriptions.map(description =>
        ({
            type: description.type,
            maxCards: description.maxCards,
            cards: []
        })
    );
    if (cardType === 'skat') {
        slots[0].cards = SKAT_CARDS()
    } else if (cardType === 'poker') {
        slots[0].cards = POKER_CARDS()
    }
    if (shuffle) {
        shuffleArray(slots[0].cards)
    }

    return {seats, slots};
}

function validateMoveRequest(moveRequest, state) {
    const [command, ...args] = moveRequest.split(' ');

    let move;
    if (command === 'move') {
        const [cardsString, fromString, toString, newIndex] = args;
        if (!(cardsString && fromString && toString)) {
            throw new ValidationError(`Invalid Move Request: ${moveRequest}`)
        }
        let from = {};
        [from.type, from.number] = fromString.split('-');
        let to = {};
        [to.type, to.number] = toString.split('-');
        const cardIds = [...new Set(cardsString.split(','))].map(idString => parseInt(idString));
        const newIndexInt = newIndex === undefined ? null : parseInt(newIndex);
        move = new MoveCards(cardIds, from, to, newIndexInt)
    } else {
        throw new ValidationError(`Invalid command: ${command}`)
    }

    if (!move.isValid(state)) {
        throw new ValidationError(`Invalid Move: ${move}`)
    }
    return move
}

let gameState = TEST_GAME();

const seatMap = new Map();

function getGameStateFor(socket) {
    const seatNumber = seatMap.get(socket.id);
    const redactedState = cloneState(gameState);
    for (let [i, seat] of redactedState.seats.entries()) {
        if (i !== seatNumber) {
            seat.cards = seat.cards.map(card => ({id: card.id, face: '*'}))
        }
    }
    for (let slot of redactedState.slots) {
        if (slot.type === 'closed') {
            slot.cards = slot.cards.map(card => ({id: card.id, face: '*'}))
        }
    }
    return redactedState
}

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected`);

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
    });

    socket.on('getState', () => {
        socket.emit('stateUpdate', {state: getGameStateFor(socket)});
    });

    socket.on('takeSeat', (seatNumber) => {
        seatMap.set(socket.id, seatNumber);
        socket.emit('stateUpdate', {state: getGameStateFor(socket)});
    });

    socket.on('requestMove', (moveRequest) => {
        console.log(`Requested move by Socket ${socket.id}: ${moveRequest}`);

        try {
            const move = validateMoveRequest(moveRequest, gameState);
            gameState = move.apply(gameState);

            const moveResponse = move.serialize();
            socket.emit('confirmMove', {move: moveResponse, state: getGameStateFor(socket)});
            socket.broadcast.emit('remoteMove');
        } catch (err) {
            if (err instanceof ValidationError) {
                socket.emit('rejectMove', {error: err.message, state: getGameStateFor(socket)});
            } else {
                throw err
            }
        }
    });
});

server.listen(8000, () => {
    console.log('listening on *:8000');
});
