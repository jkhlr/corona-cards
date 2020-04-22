<template>
    <div
            class="card-slot"
            :class="{
                highlighted: isHighlighted,
                narrow: config.display === 'stack',
                wide: config.display === 'fan'
            }"
    >
        <card-container :slug="slug" :display="config.display"/>
        <span class="border-text">{{config.name}}</span>
    </div>
</template>

<script>
    import CardContainer from "@/components/CardContainer";

    export default {
        name: "CardSlot",
        props: {
            slug: {
                type: String,
                required: true
            }
        },
        computed: {
            isHighlighted() {
                return this.$store.getters.lastMoveFromSlug === this.slug
            },
            config() {
                return this.$store.state.gameState.config[this.slug]
            }
        },
        components: {
            CardContainer
        }
    };
</script>
<style scoped>
    .card-slot {
        border-radius: 5px;
        border: var(--card-container-border) solid white;
        padding: var(--card-container-padding);

        height: var(--card-height);
        display: flex;
        position: relative;
    }

    .card-slot.highlighted {
        box-shadow: 0 0 3px 1px brown;
    }

    .card-slot.narrow {
        margin: 4px calc(4px + var(--card-width) / 2);
        width: var(--card-width);
    }

    .card-slot.wide {
        margin: 4px;
        width: calc(2 * var(--card-width));
    }

    .card-slot .border-text {
        font-size: 12px;
        line-height: 10px;
        position: absolute;
        background: darkseagreen;
        padding: 0 3px;
        bottom: -5px;
        right: 10px;
    }
</style>
