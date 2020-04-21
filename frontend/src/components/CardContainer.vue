<template>
    <vue-draggable
            class="card-container"
            :value="cards"
            @end="endDrag"
            :move="checkDrag"
            group="cards"
            filter=".non-movable"
            :delay="1"
            :delayOnTouchOnly="true"
            :componentData="{attrs: {name: this.name}}"
    >
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
                const fromSlug = from.attributes['name'].value;
                const toSlug = to.attributes['name'].value;
                const cardId = parseInt(item.attributes['card-id'].value)
                if (fromSlug !== toSlug || oldIndex !== newIndex) {
                    this.$store.commit('moveCard', {cardId, fromSlug, toSlug, newIndex});
                }
            },
            checkDrag({from, to, dragged, draggedContext: {index: oldIndex, futureIndex: newIndex}}) {
                const fromSlug = from.attributes['name'].value;
                const toSlug = to.attributes['name'].value;
                const cardId = parseInt(dragged.attributes['card-id'].value)
                console.log(fromSlug, toSlug, cardId)
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
            },
            updateOverlap() {
                const containerElement = this.$refs.root
                const containerWidth = 108
                const numCards = this.numCards + 1;
                const cardWidth = parseInt(getComputedStyle(containerElement).getPropertyValue('--card-width'))
                let overlap = (numCards * cardWidth - containerWidth) / ((numCards - 1) * cardWidth)
                if (overlap < 0.5) {
                    overlap = 0.5
                }
                this.$refs.root.style.setProperty('--overlap', overlap.toString())
            }
        },
        components: {
            vueDraggable,
            Card
        },
    };
</script>
<style scoped>
    .card-container {
        width: 100%;
        height: 100%;
    }
</style>
