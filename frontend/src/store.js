import Vue from "vue";
import Vuex from 'vuex'
import socket from './socket'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        gameState: {
            seats: [],
            slots: []
        },
        moveHistory: [],
    },
    mutations: {
        updateState(state, {gameState, moveHistory}) {
            state.gameState = gameState;
            state.moveHistory = moveHistory;
        },
        moveCard(state, {card, fromSlug, toSlug, oldIndex, newIndex}) {
            const [fromType, fromNumber] = fromSlug.split('-');
            const [toType, toNumber] = toSlug.split('-');
            let from;
            if (fromType === 'slot') {
                from = state.gameState.slots[fromNumber]
            } else if (fromType === 'seat') {
                from = state.gameState.seats[fromNumber]
            } else {
                throw new TypeError(`Invalid type: ${fromType}`)
            }
            let to;
            if (toType === 'slot') {
                to = state.gameState.slots[toNumber]
            } else if (toType === 'seat') {
                to = state.gameState.seats[toNumber]
            } else {
                throw new TypeError(`Invalid type: ${toType}`)
            }

            from.cards = from.cards
                .slice(0, oldIndex)
                .concat(from.cards.slice(oldIndex + 1));
            to.cards = to.cards
                .slice(0, newIndex)
                .concat([{face: card.face, id: card.id}])
                .concat(to.cards.slice(newIndex));

            socket.emit('requestMove', {
                command: 'move',
                args: {
                    cards: [{id: card.id, face: card.face}],
                    from: {
                        type: fromType,
                        number: fromNumber
                    },
                    to: {
                        type: toType,
                        number: toNumber
                    },
                    at: newIndex
                }
            })
        }
    }
});
