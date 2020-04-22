<template>
    <div class="card-slot" :class="{highlighted: isHighlighted, [display]: true}">
        <card-container :name="name" :display="display"/>
    </div>
</template>

<script>
    import CardContainer from "@/components/CardContainer";

    export default {
        name: "CardSlot",
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
            display() {
                return this.$store.state.gameState.config[this.name].display
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
        display: flex
    }

    .card-slot.highlighted {
        box-shadow: 0 0 3px 1px brown;
    }

    .card-slot.stack {
        margin: 4px calc(4px + var(--card-width)/2);
        width: var(--card-width);
    }

    .card-slot.fan {
        margin: 4px;
        width: calc(2 * var(--card-width));
    }
</style>
