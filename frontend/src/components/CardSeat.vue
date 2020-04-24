<template>
    <div
            class="card-seat"
            :class="{
                highlighted: isStashShown && isStashHighlighted || !isStashShown && isHighlighted,
                [orientation]: true
            }"
    >
        <span class="border-text player-name" :class="{bold: isCurrentSeat}" @click="takeSeat">{{ playerName }}</span>
        <card-container v-if="isStashShown" :slug="stashSlug"   :display="`fan ${orientation}`"/>
        <card-container v-else              :slug="slug"        :display="`fan ${orientation}`"/>
        <span class="border-text stash-toggle" v-if="hasStash" @click="toggleStash">
            <a :class="{active: isStashShown}">stash</a>
            <span> | </span>
            <a :class="{active: !isStashShown}">hand</a>
        </span>
    </div>
</template>

<script>
    import CardContainer from "@/components/CardContainer";
    import {mapMutations} from "vuex";

    export default {
        name: "CardSeat",
        props: {
            slug: {
                type: String,
                required: true
            },
            orientation: {
                type: String,
                default: 'horizontal'
            }
        },
        computed: {
            seatNumber() {
                const [_, seatNumber] = this.slug.split('-')
                return Number.parseInt(seatNumber)
            },
            seatSlug() {
                return `seat-${this.seatNumber}`
            },
            isCurrentSeat() {
                return this.seatNumber === this.$store.getters.currentPlayer.seatNumber
            },
            playerName() {
                const players = this.$store.getters.getPlayersOnSeat(this.seatNumber)
                if (players.length) {
                    return players.map(player => player.displayName).join(' + ')
                }
                return 'empty'
            },
            isHighlighted() {
                return this.$store.getters.lastMoveFromSlug === this.seatSlug
            },
            hasStash() {
                return this.$store.getters.hasStash(this.seatSlug)
            },
            stashSlug() {
                return `stash-${this.seatNumber}`
            },
            isStashHighlighted() {
                return this.$store.getters.lastMoveFromSlug === this.stashSlug
            },
            isStashShown() {
                return this.$store.getters.isStashShown(this.seatSlug) === true
            }
        },
        methods: {
            toggleStash() {
                this.$store.commit('toggleStash', {seatSlug: this.slug})
            },
            takeSeat() {
                if (!this.isCurrentSeat)
                this.$socket.emit('requestSeat', this.seatNumber)
            }
        },
        components: {
            CardContainer
        }
    };
</script>
<style scoped>
    .card-seat {
        border-radius: 5px;
        border: var(--card-container-border) solid white;
        padding: var(--card-container-padding);
        box-sizing: border-box;
        position: relative;
        width: 100%;
        height: 100%;
    }

    .card-seat.highlighted {
        box-shadow: 0 0 3px 1px brown
    }

    .card-seat .border-text {
        font-size: 12px;
        line-height: 10px;
        position: absolute;
        background: darkseagreen;
    }

    .card-seat .border-text.bold {
        font-weight: bold;
    }

    .card-seat .stash-toggle {
        padding: 0 3px;
        bottom: -5px;
        right: 10px;
    }

    .card-seat .stash-toggle .active {
        font-weight: bold;
    }

    .card-seat .player-name {
        padding: 0 3px;
        top: -5px;
        left: 10px;
    }

    .card-seat .seat-switch {
        padding: 0 3px;
        top: -5px;
        right: 10px;
    }
</style>
