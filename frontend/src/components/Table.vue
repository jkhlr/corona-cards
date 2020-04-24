<template>
    <div class="table" :style="`--card-width: ${cardSize.width}px; --card-height: ${cardSize.height}px`">
        <resize-observer ref="resizeObserver" @notify="calculateCardSize($event)"/>
        <card-seat
                v-for="config in seatConfig"
                v-bind="config"
                :class="`${config.position}-seat`"
                :key="config.slug"
        />
        <div class="slots">
            <card-slot
                    v-for="config in slotConfig"
                    v-bind="config"
                    :key="config.slug"
            />
        </div>
        <div class="game-restart" @click="restartGame"><span>restart</span></div>
        <div class="title">Corona Cards</div>
    </div>
</template>

<script>
    import CardSlot from "@/components/CardSlot";
    import CardSeat from "@/components/CardSeat";
    import {mapGetters, mapMutations, mapState} from "vuex";
    import socket from "@/socket";
    import {randomName} from "@/names";

    export default {
        name: "Table",
        computed: {
            seatConfig() {
                if (this.numSeats > 4) {
                    throw new TypeError(`Invalid number of seats: ${this.numSeats}`)
                }

                let seatSlugs = Object.keys(this.gameState.cards).filter(key => key.startsWith('seat-'));
                if (this.currentPlayer.seatNumber !== null) {
                    const currentSeatSlug = `seat-${this.currentSeatNumber}`;
                    const currentSeatSlugIndex = seatSlugs.indexOf(currentSeatSlug);
                    seatSlugs = seatSlugs.slice(currentSeatSlugIndex).concat(seatSlugs.slice(0, currentSeatSlugIndex));
                }
                return seatSlugs.map((slug, i) => ({slug, ...this.seatOrientations[i]}));
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
                return slotSlugs.map(slug => ({slug}))
            },
            currentSeatNumber() {
                return this.currentPlayer.seatNumber
            },
            ...mapState([
                'gameState',
                'cardSize'
            ]),
            ...mapGetters([
                'numSeats',
                'currentPlayer'
            ])
        },
        sockets: {
            connect() {
                this.joinTable(randomName())
            },
            stateUpdate({gameState, moveHistory}) {
                console.log(`State updated.`);
                this.updateState({gameState, moveHistory})
            },
            confirmMove({move, gameState, moveHistory}) {
                console.log(`Move confirmed:`);
                console.log(move);
                this.updateState({gameState, moveHistory})
            },
            rejectMove({error, gameState, moveHistory}) {
                console.log(`Move Request rejected: ${error}`);
                this.updateState({gameState, moveHistory})
            },
            remoteMove({move, gameState, moveHistory}) {
                console.log('Remote move:');
                console.log(move);
                this.updateState({gameState, moveHistory})
            }
        },
        methods: {
            getState() {
                console.log('State update requested');
                this.$socket.emit('getState');
            },
            joinTable(displayName) {
                console.log(`Joining table as ${displayName}.`);
                this.$socket.emit('joinTable', displayName);
            },
            switchSeat() {
                let requestedSeatNumber;
                if (this.currentSeatNumber === null) {
                    requestedSeatNumber = 0;
                } else {
                    requestedSeatNumber = (this.currentSeatNumber + 1) % this.numSeats;
                }
                console.log(`Seat ${requestedSeatNumber} requested.`);
                this.$socket.emit('requestSeat', requestedSeatNumber);
            },
            restartGame() {
                socket.emit('requestMove', {
                    command: 'start',
                    args: {gameId: this.gameState.gameId}
                })
            },
            ...mapMutations([
                'updateState',
                'calculateCardSize'
            ])
        },
        mounted() {
            this.$refs.resizeObserver.compareAndNotify()
        },
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
        position: relative;
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

    .game-restart {
        cursor: pointer;
        position: absolute;
        height: 2em;
        width: 10em;
        top: calc(var(--card-container-height) / 2 + 1.5em);
        left: calc(50% - 5em);
        text-align: center;
    }

    .title {
        font-weight: bold;
        font-size: xx-large;
        grid-area: top;
        margin-top: -1em;
    }
</style>
