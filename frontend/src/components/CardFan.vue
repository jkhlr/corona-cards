<template>
    <div>
        <draggable
                :value="cards"
                @end="endMove"
                :move="checkMove"
                group="cards"
                filter=".non-movable"
                class="card-fan"
                :class="orientation"
        >
            <card
                    v-for="(card, i) in cards"
                    v-bind="card"
                    :class="{
                        'non-movable': canMove !== 'all' && (canMove !== 'last' || cards.length - i > 1)
                    }"
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
        name: "CardFan",
        mixins: [CardContainer],
        props: {
            cards: {
                type: Array,
                required: true
            },
            maxCards: {
                type: Number
            },
            orientation: {
                type: String,
                default: 'horizontal'
            },
            canMove: {
                type: String,
                default: 'all'
            }
        },
        methods: {
            canMoveCardAt(card, index) {
                if(this.canMove === 'all') {
                    return true
                }
                if(this.canMove === 'last') {
                    return index === this.cards.length - 1
                }
                return false
            },
            canAddCardAt(card, index) {
                if (this.maxCards !== undefined && this.cards.length >= this.maxCards) {
                    return false
                }
                if (this.canMove === 'all') {
                    return true
                }
                if(this.canMove === 'last') {
                    return index === this.cards.length
                }
                return false
            },
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
        background: darkseagreen;
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

    .card-fan {
        display: flex;
        justify-content: center;
        background: darkseagreen;
    }

    .card-fan.horizontal {
        width: 100%;
        height: var(--card-height)
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
        display: inline-flex;
        width: var(--card-height);
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
