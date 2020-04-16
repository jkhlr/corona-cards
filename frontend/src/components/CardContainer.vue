<template>
    <vue-draggable :value="cards" @end="endDrag" :move="checkDrag" group="cards" filter=".non-movable">
        <card
                v-for="(card, i) in cards"
                v-bind="card"
                :class="{'non-movable': !movable(i)}"
                :key="card.id"
                @click="clickCard"
        />
    </vue-draggable>
</template>

<script>
    import vueDraggable from 'vuedraggable';
    import Card from "@/components/Card";

    export default {
        name: "Draggable",
        props: {
            name: {
                type: String,
                required: true
            }
        },

        computed: {
            cards() {
                return this.$store.state.gameState.cards[this.name]
            },
            config() {
                return this.$store.state.gameState.config[this.name]
            },
        },
        methods: {
            movable(index) {
                if (this.config.canMove === 'all') {
                    return true
                }
                if (this.config.canMove === 'last') {
                    return index === this.cards.length - 1
                }
                return false
            },
            endDrag({from, to, item, oldIndex, newIndex}) {
                const fromSlug = from.__vue__.$parent.name;
                const toSlug = to.__vue__.$parent.name;
                const cardId = item.__vue__.id;
                if (fromSlug !== toSlug || oldIndex !== newIndex) {
                    this.$store.commit('moveCard', {cardId, fromSlug, toSlug, newIndex});
                }
            },
            checkDrag({from, to, dragged, draggedContext: {index: oldIndex, futureIndex: newIndex}}) {
                const fromSlug = from.__vue__.$parent.name;
                const toSlug = to.__vue__.$parent.name;
                const cardId = dragged.__vue__.id;
                if (fromSlug === toSlug && oldIndex === newIndex) {
                    return true
                }
                return this.$store.getters.checkMove({cardId, fromSlug, toSlug, newIndex});
            },
            clickCard(cardId) {
                const currentSeatSlug = `seat-${this.$store.state.currentSeatNumber}`;
                const fromSlug = this.name;
                const newIndex = null;
                let toSlug;
                if (this.name === currentSeatSlug) {
                    toSlug = this.$store.getters.firstOpenSlotSlug;
                } else if (this.name.startsWith('slot-') && this.$store.state.currentSeatNumber != null) {
                    toSlug = currentSeatSlug;
                }
                if (toSlug && this.$store.getters.checkMove({cardId, fromSlug, toSlug, newIndex})) {
                    this.$store.commit('moveCard', {cardId, fromSlug, toSlug, newIndex});
                }
            }
        },
        components: {
            vueDraggable,
            Card
        },
    };
</script>
