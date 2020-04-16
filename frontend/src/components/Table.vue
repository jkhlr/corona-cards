<template>
    <div class="table">
        <div class="seat-switch" @click="switchSeat">X</div>
        <card-fan
                v-for="seat in seatConfig"
                :class="`${seat.position}-seat`"
                :orientation="seat.orientation"
                :name="seat.name"
                :key="seat.name"
        />
        <card-stack
                v-for="slot in slotConfig"
                :class="`${slot.position}-slot`"
                :name="slot.name"
                :key="slot.name"
        />
    </div>
</template>

<script>
    import CardStack from "@/components/CardStack";
    import CardFan from "@/components/CardFan";
    import {mapGetters, mapMutations, mapState} from "vuex";

    export default {
        name: "Table",
        data() {
            return {
                playerName: '',
                requestingMove: false
            }
        },
        computed: {
            seatConfig() {
                if (this.numSeats > 4) {
                    throw TypeError(`Invalid number of seats: ${this.numSeats}`)
                }

                let seatSlugs = Object.keys(this.gameState.cards).filter(key => key.startsWith('seat-'));
                if (this.currentSeatNumber !== null) {
                    const currentSeatSlug = `seat-${this.currentSeatNumber}`;
                    const currentSeatSlugIndex = seatSlugs.indexOf(currentSeatSlug);
                    seatSlugs = seatSlugs.slice(currentSeatSlugIndex).concat(seatSlugs.slice(0, currentSeatSlugIndex));
                }

                const seatOrientations = [
                    {
                        position: 'bottom',
                        orientation: 'horizontal'
                    },
                    {
                        position: 'left',
                        orientation: 'vertical'
                    },
                    {
                        position: 'top',
                        orientation: 'horizontal'
                    },
                    {
                        position: 'right',
                        orientation: 'vertical'
                    }
                ];

                const cards = seatSlugs.map(slug => this.gameState.cards[slug]);
                return seatSlugs.map(
                    (slug, i) => ({
                        name: slug,
                        cards: cards[i],
                        ...seatOrientations[i]
                    })
                );
            },
            slotConfig() {
                const cards = Object.fromEntries(Object.entries(this.gameState.cards).filter(([key]) => key.startsWith('slot-')));
                if (Object.keys(cards).length === 2) {
                    return [
                        {
                            cards: cards['slot-0'],
                            name: 'slot-0',
                            position: 'left'
                        },
                        {
                            cards: cards['slot-1'],
                            name: 'slot-1',
                            position: 'right',
                        },
                    ]
                }
                return []
            },
            ...mapState([
                'gameState',
                'currentSeatNumber'
            ]),
            ...mapGetters([
                'numSeats'
            ])
        }
        ,
        sockets: {
            stateUpdate({gameState, moveHistory}) {
                if (!this.requestingMove) {
                    this.updateState({gameState, moveHistory})
                }
            }
            ,
            confirmMove({move, gameState, moveHistory}) {
                console.log(`Move confirmed:`);
                console.log(move);
                this.requestingMove = false;
                this.updateState({gameState, moveHistory})
            }
            ,
            rejectMove({error, gameState, moveHistory}) {
                console.log(`Move Request rejected: ${error}`);
                this.requestingMove = false;
                this.updateState({gameState, moveHistory})
            }
            ,
            remoteMove({move, gameState, moveHistory}) {
                console.log('Remote move:');
                console.log(move);
                if (!this.requestingMove) {
                    this.updateState({gameState, moveHistory})
                }
            }
        }
        ,
        methods: {
            getState() {
                console.log('State update requested');
                this.$socket.emit('getState');
            }
            ,
            setName(name) {
                console.log(`Name ${name} set`);
                this.$socket.emit('setName', name);
            }
            ,
            switchSeat() {
                if (this.currentSeatNumber === null) {
                    this.takeSeat({seatNumber: 0})
                } else {
                    this.takeSeat({seatNumber: (this.currentSeatNumber + 1) % this.numSeats});
                }
            }
            ,
            ...
                mapMutations([
                    'updateState',
                    'takeSeat'
                ])
        }
        ,
        watch: {
            playerName() {
                this.setName(this.playerName)
            }
        }
        ,
        created() {
            this.$socket.emit('getState');
        }
        ,
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
        grid-template-columns: var(--card-container-height) 1fr 1fr var(--card-container-height);
        grid-template-rows: var(--card-container-height) 1fr var(--card-container-height);
        align-items: center;
        justify-items: center;
        column-gap: 15px;
        row-gap: 15px;

        --card-width: 60px;
        --card-height: 100px;
        --card-container-border: 2px;
        --card-container-padding: 4px;
        --card-container-height: calc(var(--card-height) + 2 * (var(--card-container-border) + var(--card-container-padding)));
        --card-container-width: calc(var(--card-width) + 2 * (var(--card-container-border) + var(--card-container-padding)));
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
