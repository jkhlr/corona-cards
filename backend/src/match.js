import {FlipCard, MoveCard, StartGame} from "./commands";

class Match {
    constructor(id) {
        this.id = id;
        this.gameState = {};
        this.moveHistory = [];
        this.playerMap = new PlayerMap();
    }

    getGameStateFor(clientId) {
        const currentPlayer = this.playerMap.getCurrentPlayer(clientId)
        const cards = Object.fromEntries(
            Object.entries(this.gameState.cards || {}).map(
                ([key, cards]) => {
                    if (key === `seat-${currentPlayer.seatNumber}`) {
                        return [key, cards]
                    }
                    if (this.gameState.config[key].isOpen) {
                        return [key, cards.map(card => ({...card, face: card.flipped ? '*' : card.face}))]
                    }
                    return [key, cards.map(card => ({...card, face: card.flipped ? card.face : '*'}))]
                }
            )
        );
        const players = this.playerMap.getOtherPlayers(clientId)
        return {...this.gameState, cards, currentPlayer, players}
    }

    applyCommandRequest(commandRequest) {
        const command = this._parseCommandRequest(commandRequest);
        if (!command.isValid(this.gameState)) {
            throw new ValidationError(`Invalid command.`)
        }
        this.gameState = command.apply(this.gameState);
        this.moveHistory = [...this.moveHistory, command.serialize()];
    }

    _parseCommandRequest(commandRequest) {
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
}


class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
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

    getClientIds(socketId) {
        return [...this.socketMap.keys()].filter(
            otherSocketId => otherSocketId !== socketId
        )
    }
}

export {Match, ValidationError}
