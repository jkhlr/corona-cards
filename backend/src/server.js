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

const SKAT_GAME = () =>
    getInitialGameState(
        3,
        [
            {type: 'closed', maxCards: null},
            {type: 'open', maxCards: null}
        ],
        'skat',
        true
    );

const UNO_GAME = () =>
    getInitialGameState(
        4,
        [
            {type: 'closed', maxCards: null},
            {type: 'open', maxCards: null}
        ],
        'skat',
        false
    );

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
    const move = parseMove(moveRequest);
    if (move.isValid(state)) {
        return move
    }
    throw new ValidationError(`Invalid move`)
}

function parseMove(moveRequest) {
    if (moveRequest.command === 'move') {
        const cards = moveRequest.args.cards.map(card => card.id);
        const from = moveRequest.args.from;
        const to = moveRequest.args.to;
        const at = moveRequest.args.at;
        return new MoveCards(cards, from, to, at)
    } else {
        throw new ValidationError(`Invalid command: ${moveRequest.command}`)
    }
}

let gameState = UNO_GAME();
let moveHistory = [];

const seatMap = new Map();

function getGameStateFor(socket) {
    // TODO: history might leak redacted game state through move description!
    const seatNumber = seatMap.get(socket.id).seatNumber;
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
    seatMap.set(socket.id, {seatNumber: null, name: null});

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
        seatMap.delete(socket.id)
    });

    socket.on('getState', () => {
        socket.emit('stateUpdate', {gameState: getGameStateFor(socket), moveHistory});
    });

    socket.on('takeSeat', (seatNumber) => {
        seatMap.set(socket.id, {...seatMap.get(socket.id), seatNumber});
        socket.emit('stateUpdate', {gameState: getGameStateFor(socket), moveHistory});
    });

    socket.on('setName', (name) => {
        seatMap.set(socket.id, {...seatMap.get(socket.id), name});
        socket.emit('stateUpdate', {gameState: getGameStateFor(socket), moveHistory});
    });

    socket.on('requestMove', (moveRequest) => {
        console.log(`Requested move by socket ${socket.id}:`);
        console.log(moveRequest);

        try {
            const move = validateMoveRequest(moveRequest, gameState);
            gameState = move.apply(gameState);
            moveHistory = [...moveHistory, moveRequest];
            socket.emit('confirmMove', {move: moveRequest, gameState: getGameStateFor(socket), moveHistory});
            Object.values(io.sockets.connected)
                .filter(otherSocket => otherSocket.id !== socket.id)
                .forEach(otherSocket =>
                    otherSocket.emit('remoteMove', {move: moveRequest, gameState: getGameStateFor(otherSocket), moveHistory})
                );
        } catch (err) {
            if (err instanceof ValidationError) {
                socket.emit('rejectMove', {move: moveRequest, error: err.message, gameState: getGameStateFor(socket), moveHistory});
            } else {
                throw err
            }
        }
    });
});

server.listen(8000, () => {
    console.log('listening on *:8000');
});
