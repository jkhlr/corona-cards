<template>
    <div class="table" :style="`--card-width: ${cardSize.width}px; --card-height: ${cardSize.height}px`">
        <resize-observer ref="resizeObserver" @notify="setTableSize($event)"/>
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
    </div>
</template>

<script>
    import {mapGetters, mapMutations} from "vuex";
    import CardSlot from "@/components/CardSlot";
    import CardSeat from "@/components/CardSeat";

    export default {
        name: "Table",
        computed: {
            seatConfig() {
                if (this.numSeats > 4) {
                    throw new TypeError(`Invalid number of seats: ${this.numSeats}`)
                }

                const currentSeatNumber = this.currentPlayer.seatNumber
                let seatSlugs = Object.keys(this.gameConfig).filter(key => key.startsWith('seat-'));
                if (currentSeatNumber !== null) {
                    const currentSeatSlug = `seat-${currentSeatNumber}`;
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
            gameConfig() {
                return this.$store.state.gameState.config || {}
            },
            ...mapGetters([
                'cardSize',
                'numSeats',
                'currentPlayer'
            ])
        },
        methods:
            mapMutations([
                'setTableSize'
            ]),
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
        --card-border: 1px;
        --card-container-border: 2px;
        --card-container-padding: 8px;
        --card-container-height: calc(var(--card-height) + 2 * (var(--card-container-border) + var(--card-container-padding)));
        --card-slot-margin: 4px;
        --grid-gap: 4px;

        position: relative;
        background: darkseagreen;
        box-sizing: border-box;
        height: 100%;
        padding: var(--grid-gap) 0;

        display: grid;
        grid-template-columns: var(--card-container-height) 1fr var(--card-container-height);
        grid-template-rows: var(--card-container-height) 1fr var(--card-container-height);
        align-items: center;
        justify-items: center;
        column-gap: var(--grid-gap);
        row-gap: var(--grid-gap);

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
</style>
