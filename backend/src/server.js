import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import {MoveCards} from "./commands";
import {ValidationError} from "./utils";

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
            {isOpen: false, maxCards: null, canMove: 'last'},
            {isOpen: true, maxCards: null, canMove: 'last'}
        ],
        'skat',
        true
    );

const UNO_GAME = () =>
    getInitialGameState(
        4,
        [
            {isOpen: false, maxCards: null, canMove: 'last'},
            {isOpen: true, maxCards: null, canMove: 'last'}
        ],
        'poker',
        true
    );

function getInitialGameState(numSeats, slotDescriptions, cardType, shuffle) {
    const seatCardEntries = Array(numSeats).fill(null).map(
        (_, i) =>
            [`seat-${i}`, []]
    );
    const slotCardEntries = slotDescriptions.map(
        (_, i) =>
            [`slot-${i}`, []]
    );
    const cards = Object.fromEntries(seatCardEntries.concat(slotCardEntries));

    const seatConfigEntries = Array(numSeats).fill(null).map(
        (_, i) =>
            [`seat-${i}`, {closed: true, maxCards: null, canMove: 'all'}]
    );
    const slotConfigEntries = slotDescriptions.map(
        (description, i) =>
            [`slot-${i}`, {...description}]
    );
    const config = Object.fromEntries(seatConfigEntries.concat(slotConfigEntries));

    if (cardType === 'skat') {
        cards['slot-0'] = SKAT_CARDS()
    } else if (cardType === 'poker') {
        cards['slot-0'] = POKER_CARDS()
    }
    if (shuffle) {
        shuffleArray(cards['seat-0'])
    }
    return {cards, config};
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
        const cardId = moveRequest.args.cardId;
        const fromSlug = moveRequest.args.fromSlug;
        const toSlug = moveRequest.args.toSlug;
        const newIndex = moveRequest.args.newIndex;
        return new MoveCards([cardId], fromSlug, toSlug, newIndex)
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
    const cards = Object.fromEntries(
        Object.entries(gameState.cards).map(
            ([key, cards]) => {
                if (key === `seat-${seatNumber}` || gameState.config[key].isOpen) {
                    return [key, cards]
                }
                return [key, cards.map(card => ({...card, face: '*'}))];
            }
        )
    );
    return {...gameState, cards}
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
            socket.emit('confirmMove', {
                move: moveRequest,
                gameState: getGameStateFor(socket),
                moveHistory
            });
            const otherSockets = Object.values(io.sockets.connected).filter(
                otherSocket =>
                    otherSocket.id !== socket.id
            );
            otherSockets.forEach(
                otherSocket =>
                    otherSocket.emit('remoteMove', {
                        move: moveRequest,
                        gameState: getGameStateFor(otherSocket),
                        moveHistory
                    })
            );
        } catch (err) {
            if (err instanceof ValidationError) {
                socket.emit('rejectMove', {
                    move: moveRequest,
                    error: err.message,
                    gameState: getGameStateFor(socket),
                    moveHistory
                });
            } else {
                throw err
            }
        }
    });
})
;

server.listen(8000, () => {
    console.log('listening on *:8000');
});
