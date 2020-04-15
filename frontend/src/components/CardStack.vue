<template>
    <div>
        <draggable
                :value="cards"
                @end="endMove"
                :move="checkMove"
                group="cards"
                filter=".non-movable"
                class="card-stack"
        >
            <card
                    v-for="(card, i) in cards"
                    v-bind="card"
                    :class="{'non-movable': cards.length - i > 1}"
                    :key="card.id"
            />
        </draggable>
    </div>
</template>

<script>
    import draggable from 'vuedraggable';
    import Card from "@/components/Card";
    import CardContainer from '@/components/mixins/CardContainer'

    export default {
        name: "CardStack",
        mixins: [CardContainer],
        props: {
            name: {
                type: String,
                required: true
            },
            // TODO: remove
            cards: {
                type: Array,
                required: true
            },
            maxCards: {
                type: Number
            }
        },
        methods: {
            canMoveCarTo(card, index) {
                return index === this.cards.length - 1
            },
            canAddCardAt(card, index) {
                if (index === this.cards.length) {
                    return this.maxCards === undefined || index < this.maxCards
                }
                return false
            }
        },
        components: {
            draggable,
            Card
        }
    };
</script>
<style scoped>
    .card-stack {
        display: flex;
        justify-content: center;
        height: var(--card-height)
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
