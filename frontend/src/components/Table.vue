<template>
    <div class="table">
        <div class="seat-switch" @click="switchSeat">X</div>
        <card-fan
                v-for="seat in seatConfig"
                :cards="seat.cards"
                :orientation="seat.orientation"
                :class="`${seat.position}-seat`"
                :name="seat.name"
                :ref="seat.name /* TODO: remove */"
                :key="seat.name"
                @card-move="onCardMove"
        />
        <card-stack
                v-for="slot in slotConfig"
                :cards="slot.cards"
                :class="`${slot.position}-slot`"
                :name="slot.name"
                :ref="slot.name /* TODO: remove */"
                :key="slot.name"
                @card-move="onCardMove"
        />
    </div>
</template>

<script>
    import CardStack from "@/components/CardStack";
    import CardFan from "@/components/CardFan";
    import {mapMutations, mapState} from "vuex";

    export default {
        name: "Table",
        data() {
            return {
                playerName: '',
                requestingMove: false,
                currentSeat: null
            }
        },
        computed: {
            seatConfig() {
                const seats = this.gameState.seats;
                if (seats.length === 4) {
                    return [
                        {
                            cards: seats[0].cards,
                            name: 'seat-0',
                            position: 'bottom',
                            orientation: 'horizontal'
                        },
                        {
                            cards: seats[1].cards,
                            name: 'seat-1',
                            position: 'left',
                            orientation: 'vertical'
                        },
                        {
                            cards: seats[2].cards,
                            name: 'seat-2',
                            position: 'top',
                            orientation: 'horizontal'
                        },
                        {
                            cards: seats[3].cards,
                            name: 'seat-3',
                            position: 'right',
                            orientation: 'vertical'
                        },
                    ]
                }
                return []
            },
            slotConfig() {
                const slots = this.gameState.slots;
                if (slots.length === 2) {
                    return [
                        {
                            cards: slots[0].cards,
                            name: 'slot-0',
                            position: 'left'
                        },
                        {
                            cards: slots[1].cards,
                            name: 'slot-1',
                            position: 'right',
                        },
                    ]
                }
                return []
            },
            ...mapState([
                'gameState',
                'moveHistory'
            ])
        },
        sockets: {
            stateUpdate({gameState, moveHistory}) {
                if (!this.requestingMove) {
                    this.updateState({gameState, moveHistory})
                }
            },
            confirmMove({move, gameState, moveHistory}) {
                console.log(`Move confirmed:`);
                console.log(move);
                this.requestingMove = false;
                this.updateState({gameState, moveHistory})
            },
            rejectMove({error, gameState, moveHistory}) {
                console.log(`Move Request rejected: ${error}`);
                this.requestingMove = false;
                this.updateState({gameState, moveHistory})
            },
            remoteMove({move, gameState, moveHistory}) {
                console.log('Remote move:');
                console.log(move);
                if (!this.requestingMove) {
                    this.updateState({gameState, moveHistory})
                }
            }
        },
        methods: {
            onCardMove({card, from, to, oldIndex, newIndex}) {
                const fromSlug = this.getRefSlug(from);
                const toSlug = this.getRefSlug(to);
                this.requestingMove = true;
                this.moveCard({card, fromSlug, toSlug, oldIndex, newIndex})
            },
            getState() {
                console.log('State update requested');
                this.$socket.emit('getState');
            },
            takeSeat(seatNumber) {
                console.log(`Seat ${seatNumber} taken`);
                this.$socket.emit('takeSeat', seatNumber);
            },
            setName(name) {
                console.log(`Name ${name} set`);
                this.$socket.emit('setName', name);
            },
            getRefSlug(component) {
                for (let [slug, obj] of Object.entries(this.$refs)) {
                    if (obj === component || (Array.isArray(obj) && obj.length === 1 && obj[0] === component)) {
                        return slug;
                    }
                }
                throw new TypeError(`Component has no ref slug: ${component}`)
            },
            switchSeat() {
                if (this.currentSeat === null) {
                    this.currentSeat = 0
                } else {
                    this.currentSeat = ((this.currentSeat + 1) % 4)
                }
            },
            ...mapMutations([
                'updateState',
                'moveCard'
            ])
        },
        watch: {
            currentSeat() {
                this.takeSeat(this.currentSeat)
            },
            playerName() {
                this.setName(this.playerName)
            }
        },
        created() {
            this.$socket.emit('getState');
        },
        components: {
            CardStack,
            CardFan
        }
    }
</script>

<style scoped>
    .table {
        height: 100%;
        background: darkseagreen;
        padding: 10px;
        box-sizing: border-box;

        display: grid;
        grid-template-columns: var(--card-height) 1fr 1fr var(--card-height);
        grid-template-rows: var(--card-height) 1fr var(--card-height);
        align-items: center;
        column-gap: 10px;
        row-gap: 10px;

        --card-width: 60px;
        --card-height: 100px;
    }

    .seat-switch {
        cursor: pointer;
        position: absolute;
        top: 50%;
        left: 50%;
    }

    .left-seat {
        grid-column-start: 1;
        grid-column-end: 2;
        grid-row-start: 1;
        grid-row-end: 4;
    }

    .right-seat {
        grid-column-start: 4;
        grid-column-end: 5;
        grid-row-start: 1;
        grid-row-end: 4;
    }

    .top-seat {
        grid-column-start: 2;
        grid-column-end: 4;
        grid-row-start: 1;
        grid-row-end: 2;
    }

    .bottom-seat {
        grid-column-start: 2;
        grid-column-end: 4;
        grid-row-start: 3;
        grid-row-end: 4;
    }

    .left-slot {
        grid-column-start: 2;
        grid-column-end: 3;
        grid-row-start: 2;
        grid-row-end: 3;
    }

    .right-slot {
        grid-column-start: 3;
        grid-column-end: 4;
        grid-row-start: 2;
        grid-row-end: 3;
    }
</style>
