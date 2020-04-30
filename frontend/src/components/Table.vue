<template>
    <div class="table" :style="`--card-width: ${cardSize.width}px; --card-height: ${cardSize.height}px`">
        <div class="title">Corona Cards</div>
        <div v-if="gameConfig.gameId" class="game-start" @click="restartGame"><span>restart</span></div>
        <div v-else class="game-start" @click="startGame('skat')"><span>start</span></div>
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
        <resize-observer ref="resizeObserver" @notify="setTableSize($event)"/>
    </div>
</template>

<script>
    import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
    import {randomName} from "@/names";
    import CardSlot from "@/components/CardSlot";
    import CardSeat from "@/components/CardSeat";

    export default {
        name: "Table",
        computed: {
            seatConfig() {
                if (this.numSeats > 4) {
                    throw new TypeError(`Invalid number of seats: ${this.numSeats}`)
                }

                let seatSlugs = Object.keys(this.gameConfig).filter(key => key.startsWith('seat-'));
                if (this.currentSeatNumber !== null) {
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
                const slotSlugs = Object.keys(this.gameConfig).filter(key => key.startsWith('slot-'));
                return slotSlugs.map(slug => ({slug}))
            },
            currentSeatNumber() {
                return this.$store.getters.currentPlayer.seatNumber
            },
            numSeats() {
                return this.$store.getters.numSeats
            },
            gameConfig() {
                return this.$store.state.gameState.config || {}
            },
            ...mapGetters([
                'cardSize'
            ])
        },
        methods: {
            joinMatch({matchId, displayName}) {
                console.log(`Joining match ${matchId} as ${displayName}.`);
                this.$store.dispatch('joinMatch', {matchId, displayName});
            },
            restartGame() {
                console.log('Restarting game.')
                this.$store.dispatch('startGame', {gameId: this.gameConfig.gameId})
            },
            startGame(gameId) {
                console.log(`Starting game: ${gameId}`)
                this.$store.dispatch('startGame', {gameId})
            },
            ...mapMutations([
                'setTableSize'
            ])
        },
        mounted() {
            this.$refs.resizeObserver.compareAndNotify()
            this.joinMatch({matchId: 'default', displayName: randomName()})
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
        --card-border: 1px;
        --card-container-border: 2px;
        --card-container-padding: 8px;
        --card-container-height: calc(var(--card-height) + 2 * (var(--card-container-border) + var(--card-container-padding)));
        --card-slot-margin: 4px;
        --table-padding: 8px;

        position: relative;
        height: 100%;
        background: darkseagreen;
        padding: var(--table-padding);
        box-sizing: border-box;

        display: grid;
        grid-template-columns: var(--card-container-height) 1fr var(--card-container-height);
        grid-template-rows: var(--card-container-height) 1fr var(--card-container-height);
        align-items: center;
        justify-items: center;
        column-gap: var(--table-padding);
        row-gap: var(--table-padding);

        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        -webkit-touch-callout: none;

        overflow: hidden;
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

    .game-start {
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
