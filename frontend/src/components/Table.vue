<template>
    <div class="table" :style="`--card-width: ${cardSize.width}px; --card-height: ${cardSize.height}px`">
        <card-seat
                v-for="seat in seatConfig"
                :class="`${seat.position}-seat`"
                :orientation="seat.orientation"
                :name="seat.name"
                :key="seat.name"
        />
        <div class="slots">
            <div class="seat-switch" @click="switchSeat">
                <span>x</span>
            </div>
            <card-slot v-for="slot in slotConfig" :name="slot.name" :key="slot.name"/>
        </div>
    </div>
</template>

<script>
    import CardSlot from "@/components/CardSlot";
    import CardSeat from "@/components/CardSeat";
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
                return seatSlugs.map((slug, i) => ({name: slug, ...this.seatOrientations[i]}));
            },
            seatOrientations() {
                const [bottom, left, top, right] = [
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
                ]

                if (this.numSeats === 1) {
                    return [bottom];
                } else if (this.numSeats === 2) {
                    return [bottom, top]
                } else if (this.numSeats === 3) {
                    return [bottom, left, right]
                } else if (this.numSeats === 4) {
                    return [bottom, left, top, right]
                }
            },
            slotConfig() {
                const slotSlugs = Object.keys(this.gameState.cards).filter(key => key.startsWith('slot-'));
                return slotSlugs.map(slug => ({name: slug}))
            },
            ...mapState([
                'gameState',
                'currentSeatNumber',
                'cardSize'
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
            ...mapMutations([
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
            CardSlot,
            CardSeat
        }
    }
</script>

<style scoped>
    .table {
        --card-width: none;
        --card-height: none;
        --card-container-border: 2px;
        --card-container-padding: 8px;
        --card-container-height: calc(var(--card-height) + 2 * (var(--card-container-border) + var(--card-container-padding)));
    }

    .table {
        height: 100%;
        background: darkseagreen;
        padding: 8px;
        box-sizing: border-box;

        display: grid;
        grid-template-columns: var(--card-container-height) 1fr var(--card-container-height);
        grid-template-rows: var(--card-container-height) 1fr var(--card-container-height);
        align-items: center;
        justify-items: center;
        column-gap: 8px;
        row-gap: 8px;

        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        -webkit-touch-callout: none;
    }

    @media (orientation: landscape) {
        .table {
            grid-template-areas: "left top right" "left slots right" "left bottom right";
        }
    }

    @media (orientation: portrait) {
        .table {
            grid-template-areas: "top top top" "left slots right" "bottom bottom bottom";
        }
    }

    .left-seat {
        grid-area: left;
    }

    .right-seat {
        grid-area: right;
    }

    .top-seat {
        grid-area: top;
    }

    .bottom-seat {
        grid-area: bottom;
    }

    .slots {
        grid-area: slots;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-content: center;
        width: 100%;
        height: 100%;
    }

    .seat-switch {
        cursor: pointer;
        position: absolute;
        height: 2em;
        width: 2em;
        top: calc(50% - 1em);
        left: calc(50% - 1em);
        text-align: center;
        font-weight: bold;
    }
</style>
