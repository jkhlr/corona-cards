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

function getGameStateFor(socketId) {
    const currentPlayer = playerMap.getCurrentPlayer(socketId)
    const cards = Object.fromEntries(
        Object.entries(gameState.cards).map(
            ([key, cards]) => {
                if (key === `seat-${currentPlayer.seatNumber}`) {
                    return [key, cards]
                }
                if (gameState.config[key].isOpen) {
                    return [key, cards.map(card => ({...card, face: card.flipped ? '*' : card.face}))]
                }
                return [key, cards.map(card => ({...card, face: card.flipped ? card.face : '*'}))]
            }
        )
    );
    const players = playerMap.getOtherPlayers(socketId)
    return {...gameState, cards, currentPlayer, players}
}

class PlayerMap {
    constructor() {
        this.socketMap = new Map();
    }

    addPlayer(socketId) {
        this.socketMap.set(socketId, {seatNumber: null, displayName: null})
    }

    removePlayer(socketId) {
        this.socketMap.delete(socketId)
    }

    updateSeatNumber(socketId, seatNumber) {
        const currentPlayerInfo = this.socketMap.get(socketId);
        this.socketMap.set(socketId, {...currentPlayerInfo, seatNumber})
    }

    updateDisplayName(socketId, displayName) {
        const currentPlayerInfo = this.socketMap.get(socketId);
        this.socketMap.set(socketId, {...currentPlayerInfo, displayName})
    }

    getCurrentPlayer(socketId) {
        return this.socketMap.get(socketId);
    }

    getOtherPlayers(socketId) {
        return [...this.socketMap.entries()].filter(
            ([otherSocketId, _]) => otherSocketId !== socketId
        ).map(
            ([_, player]) => player
        )
    }
}

function broadcastStateUpdate() {
    Object.values(io.sockets.connected).filter(
        socket => playerMap.getCurrentPlayer(socket.id)
    ).forEach(
        socket => socket.emit('stateUpdate', {gameState: getGameStateFor(socket.id), moveHistory})
    )
}

const startGame = new StartGame('skat')
let gameState = startGame.apply()
let moveHistory = [];
const playerMap = new PlayerMap()

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected`);

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
        playerMap.removePlayer(socket.id)
        broadcastStateUpdate()
    });

    socket.on('joinTable', (displayName) => {
        playerMap.addPlayer(socket.id)
        playerMap.updateDisplayName(socket.id, displayName)
        broadcastStateUpdate()
    });

    socket.on('requestSeat', (seatNumber) => {
        playerMap.updateSeatNumber(socket.id, seatNumber)
        broadcastStateUpdate()
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
                gameState: getGameStateFor(socket.id),
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
                        gameState: getGameStateFor(otherSocket.id),
                        moveHistory
                    })
            );
        } catch (err) {
            if (err instanceof ValidationError) {
                socket.emit('rejectMove', {
                    move: commandRequest,
                    error: err.message,
                    gameState: getGameStateFor(socket.id),
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

