<template>
    <div class="card-fan" :class="{ highlighted: isHighlighted }">
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

        width: calc(2 * var(--card-width));
        height: var(--card-height);
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
