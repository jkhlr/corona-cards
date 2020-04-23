import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import {MoveCard, StartGame, FlipCard} from "./commands";

const app = express();
const server = http.createServer(app);
const io = socketio(server, {path: '/ws/socket.io'});

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

function validateCommandRequest(commandRequest, state) {
    const command = parseCommandRequest(commandRequest);
    if (command.isValid(state)) {
        return command
    }
    throw new ValidationError(`Invalid command.`)
}

function parseCommandRequest(commandRequest) {
    if (commandRequest.command === 'move') {
        const {cardId, fromSlug, toSlug, newIndex} = commandRequest.args;
        return new MoveCard(cardId, fromSlug, toSlug, newIndex);
    }
    if (commandRequest.command === 'flip') {
        const {cardId, containerSlug} = commandRequest.args
        return new FlipCard(cardId, containerSlug)
    }
    if (commandRequest.command === 'start') {
        const {gameId} = commandRequest.args;
        return new StartGame(gameId);
    }
    throw new ValidationError(`Invalid command request: ${commandRequest.command}`);
}

function getGameStateFor(socket) {
    const seatNumber = seatMap.get(socket.id).seatNumber;
    const cards = Object.fromEntries(
        Object.entries(gameState.cards).map(
            ([key, cards]) => {
                if (key === `seat-${seatNumber}`) {
                    return [key, cards]
                }
                if (gameState.config[key].isOpen) {
                    return [key, cards.map(card => ({...card, face: card.flipped ? '*' : card.face}))]
                }
                return [key, cards.map(card => ({...card, face: card.flipped ? card.face: '*'}))]
            }
        )
    );
    return {...gameState, cards}
}

const startGame = new StartGame('SKAT')
let gameState = startGame.apply()
let moveHistory = [];
const seatMap = new Map();

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

    socket.on('requestMove', (commandRequest) => {
        console.log(`Requested move by socket ${socket.id}:`);
        console.log(commandRequest);

        try {
            const command = validateCommandRequest(commandRequest, gameState);
            gameState = command.apply(gameState);
            moveHistory = [...moveHistory, commandRequest];
            socket.emit('confirmMove', {
                move: commandRequest,
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
                        move: commandRequest,
                        gameState: getGameStateFor(otherSocket),
                        moveHistory
                    })
            );
        } catch (err) {
            if (err instanceof ValidationError) {
                socket.emit('rejectMove', {
                    move: commandRequest,
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

