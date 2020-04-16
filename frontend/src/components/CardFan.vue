<template>
    <div style="height: 100%; width: 100%">
        <card-container
                class="card-fan"
                :class="{highlighted: isHighlighted, [orientation]: true}"
                :name="name"
        />
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
            },
            orientation: {
                type: String,
                default: 'horizontal'
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
        display: flex;
        justify-content: center;

        border-radius: 5px;
        border: var(--card-container-border) solid white;
        padding: var(--card-container-padding);

        box-sizing: border-box;
    }

    .card-fan.highlighted {
        box-shadow: 0 0 5px 1px brown
    }

    .card-fan.horizontal {
        flex-direction: row;
        width: 100%;
        height: var(--card-container-height);
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
