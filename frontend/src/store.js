import Vue from "vue";
import Vuex from 'vuex'
import socket from './socket'
import {MoveCard, FlipCard} from "./shared/commands";

Vue.use(Vuex);

export default new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {
        gameState: {
            cards: {},
            config: {},
            gameId: null,
            players: [],
            currentPlayer: {
                displayName: '',
                seatNumber: null
            },
            moveHistory: []
        },
        cardSize: {
            width: 50,
            height: 90
        },
        isStashShown: {}
    },
    getters: {
        canMove(state) {
            return ({cardId, fromSlug, toSlug, newIndex}) => {
                const command = new MoveCard(cardId, fromSlug, toSlug, newIndex);
                return command.isValid(state.gameState)
            }
        },
        canFlip(state) {
            return ({cardId, containerSlug}) => {
                const command = new FlipCard(cardId, containerSlug);
                return command.isValid(state.gameState)
            }
        },
        lastMove(state) {
            return state.gameState.moveHistory.filter(move => move.command === 'move').slice(-1).pop()
        },
        lastMoveCardId(state, getters) {
            if (!getters.lastMove) {
                return null
            }
            return getters.lastMove.args.cardId
        },
        lastMoveFromSlug(state, getters) {
            if (!getters.lastMove) {
                return null
            }
            return getters.lastMove.args.fromSlug
        },
        firstOpenSlotSlug(state) {
            const openSlots = Object.entries(state.gameState.config).filter(
                ([key, config]) =>
                    key.startsWith('slot-') && config.isOpen
            );
            if (openSlots) {
                const [key] = openSlots[0];
                return key;
            }
            return null
        },
        numSeats(state) {
            return Object.keys(state.gameState.cards).filter(key => key.startsWith('seat-')).length
        },
        currentPlayer(state) {
            return state.gameState.currentPlayer;
        },
        getPlayersOnSeat(state, getter) {
            return (seatNumber) => {
                let players = state.gameState.players.filter(
                    ({seatNumber: candidateSeatNumber}) =>
                        candidateSeatNumber === seatNumber
                )
                if (getter.currentPlayer.seatNumber === seatNumber) {
                    players = [getter.currentPlayer].concat(players)
                }
                return players
            }
        },
        hasStash(state) {
            return seatSlug => state.gameState.config.hasOwnProperty(seatSlug)
        },
        isStashShown(state) {
            return seatSlug => state.isStashShown[seatSlug]
        }
    },
    mutations: {
        syncState(state, {gameState}) {
            state.gameState = gameState;
        },
        applyCommand(state, {command}) {
            state.gameState = command.apply(state.gameState);
        },
        toggleStash(state, {seatSlug}) {
            state.isStashShown = {
                ...state.isStashShown,
                [seatSlug]: state.isStashShown[seatSlug] ? undefined : true
            }
        },
        calculateCardSize(state, {width, height}) {
            state.cardSize.height = 90;
            state.cardSize.width = Math.floor(state.cardSize.height * 0.65);
        }
    },
    actions: {
        joinMatch({commit}, {matchId, displayName}) {
            socket.emit(
                'joinMatch',
                {matchId, displayName},
                ({gameState}) => commit('syncState', {gameState})
            )
        },
        takeSeat({commit}, {seatNumber}) {
            socket.emit(
                'takeSeat',
                {seatNumber},
                ({gameState}) => commit('syncState', {gameState})
            )
        },
        startGame({commit}, {gameId}) {
            socket.emit(
                'applyCommand',
                {commandRequest: {command: 'start', args: {gameId}}},
                ({gameState, error}) => {
                    if (error) {
                        console.error(error)
                    } else {
                        commit('syncState', {gameState})
                    }
                }
            )
        },
        moveCard({commit}, {cardId, fromSlug, toSlug, newIndex}) {
            const command = new MoveCard(cardId, fromSlug, toSlug, newIndex);
            commit('applyCommand', {command})
            socket.emit(
                'applyCommand',
                {commandRequest: command.serialize()},
                ({gameState, error}) => {
                    if (error) {
                        console.error(error)
                    } else {
                        commit('syncState', {gameState})
                    }
                }
            )
        },
        flipCard({commit}, {cardId, containerSlug}) {
            const command = new FlipCard(cardId, containerSlug);
            commit('applyCommand', {command})
            socket.emit(
                'applyCommand',
                {commandRequest: command.serialize()},
                ({gameState, error}) => {
                    if (error) {
                        console.error(error)
                    } else {
                        commit('syncState', {gameState})
                    }
                }
            )
        },
        syncState({commit}) {
            socket.emit(
                'syncState',
                ({gameState}) => commit('syncState', {gameState})
            )
        }
    }
});
