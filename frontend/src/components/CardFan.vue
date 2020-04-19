<template>
    <div
            class="card-fan"
            :class="{
                highlighted: showStash && isStashHighlighted || !showStash && isHighlighted,
                [orientation]: true
            }"
    >
        <card-container v-if="showStash" :name="stashName"/>
        <card-container v-else :name="name"/>
        <span v-show="hasStash" class="slot-switch" @click="showStash = !showStash">o</span>
    </div>
</template>

<script>
    import CardContainer from "@/components/CardContainer";

    export default {
        name: "CardFan",
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

        display: flex;
        position: relative;
    }

    .slot-switch {
        content: 'o';
        position: absolute;
        top: -12px;
        right: -5px;
    }

    .card-fan.highlighted {
        box-shadow: 0 0 3px 1px brown
    }

    .card-fan >>> .card-container {
        display: flex;
        justify-content: center;
        flex-grow: 1;
    }

    .card-fan.horizontal {
        flex-direction: row;

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
        flex-direction: column;

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
