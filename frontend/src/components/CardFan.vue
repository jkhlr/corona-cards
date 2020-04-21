<template>
    <div class="card-fan" ref="root" :class="{ highlighted: isHighlighted }">
        <card-container :name="name"/>
    </div>
</template>

<script>
    import CardContainer from "@/components/CardContainer";

    export default {
        name: "CardFan",
        props: {
            name: {
                type: String,
                required: true
            }
        },
        computed: {
            isHighlighted() {
                return this.$store.getters.lastMoveFromSlug === this.name
            },
            numCards() {
                return this.$store.state.gameState.cards[this.name].length
            }
        },
        methods: {
            updateOverlap() {
                const containerElement = this.$refs.root
                const containerWidth = 108
                const numCards = this.numCards + 1;
                const cardWidth = parseInt(getComputedStyle(containerElement).getPropertyValue('--card-width'))
                let overlap = (numCards * cardWidth - containerWidth) / ((numCards - 1) * cardWidth)
                if (overlap < 0.5) {
                    overlap = 0.5
                }
                console.log(overlap)
                this.$refs.root.style.setProperty('--overlap', overlap.toString())
            }
        },
        components: {
            CardContainer
        },
        watch: {
            numCards() {
                this.updateOverlap()
            }
        },
        mounted() {
            this.updateOverlap()
        }
    };
</script>
<style scoped>
    .card-fan {
        border-radius: 5px;
        border: var(--card-container-border) solid white;
        padding: var(--card-container-padding);
        box-sizing: content-box;

        width: calc(2 * var(--card-width));
        height: var(--card-height);

        --overlap: 0.5;
    }

    .card-fan.highlighted {
        box-shadow: 0 0 3px 1px brown;

    }

    .card-fan >>> .card-container {
        display: flex;
        justify-content: center;
    }

    .card-fan >>> .card {
        margin-right: calc(-1 * var(--card-width) * var(--overlap));
        width: var(--card-width);
        height: var(--card-height);
    }

    .card-fan >>> .card:first-child {
        margin-left: calc(-1 * var(--card-width) * var(--overlap));
    }
</style>
