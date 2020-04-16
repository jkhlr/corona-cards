<template>
    <div>
        <card-container
                class="card-stack"
                :class="{highlighted: isHighlighted}"
                :name="name"
        >
        </card-container>
    </div>
</template>

<script>
    import CardContainer from "@/components/CardContainer";

    export default {
        name: "CardStack",
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
    .card-stack {
        display: flex;
        justify-content: center;

        border-radius: 5px;
        border: var(--card-container-border) solid white;
        padding: var(--card-container-padding);

        box-sizing: border-box;
        height: var(--card-container-height);
        width: var(--card-container-width);
    }

    .card-stack.highlighted {
        box-shadow: 0 0 3px 1px brown;
    }

    .card-stack >>> .card {
        width: var(--card-width);
        height: var(--card-height);
        margin-right: calc(var(--card-width) / -1);
    }

    .card-stack >>> .card:first-child {
        margin-left: calc(var(--card-width) / -1);
    }

</style>
