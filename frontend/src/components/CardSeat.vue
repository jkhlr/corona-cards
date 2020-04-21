<template>
    <div
            class="card-fan"
            :class="{
                highlighted: showStash && isStashHighlighted || !showStash && isHighlighted,
                [orientation]: true
            }"
    >
        <span class="border-text player-name">NAME</span>
        <card-container v-if="showStash" :name="stashName"/>
        <card-container v-else :name="name"/>
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
    .card-fan {
        border-radius: 5px;
        border: var(--card-container-border) solid white;
        padding: var(--card-container-padding);
        box-sizing: border-box;
        position: relative;
    }

    .card-fan .border-text {
        font-size: 12px;
        line-height: 10px;
        position: absolute;
        background: darkseagreen;
    }

    .card-fan .stash-toggle {
        padding: 0 3px;
        bottom: -5px;
        right: 10px;
    }

    .card-fan .stash-toggle .active {
        font-weight: bold;
    }

    .card-fan .player-name {
        padding: 0 3px;
        top: -5px;
        left: 10px;
    }

    .card-fan.highlighted {
        box-shadow: 0 0 3px 1px brown
    }

    .card-fan >>> .card-container {
        display: flex;
        justify-content: center;
    }

    .card-fan.horizontal {
        width: 100%;
        height: var(--card-container-height);
    }

    .card-fan.horizontal >>> .card-container {
        flex-direction: row;
    }

    .card-fan.horizontal >>> .card {
        margin-right: calc(var(--card-width) / -2);
        width: var(--card-width);
        height: var(--card-height);
    }

    .card-fan.horizontal >>> .card:first-child {
        margin-left: calc(var(--card-width) / -2);
    }

    .card-fan.vertical {
        width: var(--card-container-height);
        height: 100%;
    }

    .card-fan.vertical >>> .card-container {
        flex-direction: column;
    }

    .card-fan.vertical >>> .card {
        margin-bottom: calc(var(--card-width) / -2);
        width: var(--card-height);
        height: var(--card-width);
    }

    .card-fan.vertical >>> .card:first-child {
        margin-top: calc(var(--card-width) / -2);
    }

    .card-fan.vertical >>> .card img {
        transform: rotate(90deg);
        transform-origin: calc(var(--card-height) / 2) calc(var(--card-height) / 2);
    }

</style>
