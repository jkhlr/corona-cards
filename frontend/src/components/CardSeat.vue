<template>
    <div
            class="card-seat"
            :class="{
                highlighted: showStash && isStashHighlighted || !showStash && isHighlighted,
                [orientation]: true
            }"
    >
        <span class="border-text player-name">NAME</span>
        <card-container v-if="showStash" :name="stashName" :display="`fan ${orientation}`"/>
        <card-container v-else :name="name" :display="`fan ${orientation}`"/>
        <span class="border-text stash-toggle" v-if="hasStash" @click="showStash = !showStash">
            <a :class="{active: showStash}">stash</a>
            <span> | </span>
            <a :class="{active: !showStash}">hand</a>
        </span>
    </div>
</template>

<script>
    import CardContainer from "@/components/CardContainer";

    export default {
        name: "CardSeat",
        data() {
            return {
                showStash: false
            }
        },
        props: {
            name: {
                type: String,
                required: true
            },
            orientation: {
                type: String,
                default: 'horizontal'
            }
        },
        computed: {
            isHighlighted() {
                return this.$store.getters.lastMoveFromSlug === this.name
            },
            stashName() {
                const [_, seatNumber] = this.name.split('-')
                return `stash-${seatNumber}`
            },
            isStashHighlighted() {
                return this.$store.getters.lastMoveFromSlug === this.stashName
            },
            hasStash() {
                return this.$store.state.gameState.config.hasOwnProperty(this.stashName)
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
</style>
