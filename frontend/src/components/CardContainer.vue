<template>
    <div class="wrapper" :style="`--overlap-width: ${overlapWidth}; --overlap-height: ${overlapHeight}`">
        <vue-draggable
                ref="cardContainer"
                class="card-container"
                :value="cards"
                @end="endDrag"
                :move="checkDrag"
                group="cards"
                filter=".non-movable"
                :delay="50"
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
        <resize-observer ref="resizeObserver" @notify="size = $event"/>
    </div>
</template>

<script>
    import vueDraggable from 'vuedraggable';
    import Card from "@/components/Card";

    export default {
        name: "CardContainer",
        data() {
            return {
                size: {
                    width: null,
                    height: null
                },
                numCardElements: null
            }
        },
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
            overlapWidth() {
                const cardWidth = this.$store.state.cardSize.width;
                const overlap =
                    (this.numCardElements * cardWidth - this.size.width) /
                    ((this.numCardElements - 1) * cardWidth)
                return Math.max(overlap, 0.5)
            },
            overlapHeight() {
                const cardWidth = this.$store.state.cardSize.width;
                const overlap =
                    (this.numCardElements * cardWidth - this.size.height) /
                    ((this.numCardElements - 1) * cardWidth)
                return Math.max(overlap, 0.5)
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
            }
        },
        mounted() {
            this.$refs.resizeObserver.compareAndNotify()
            const draggableElement = this.$refs.cardContainer.$el
            this.numCardElements = draggableElement.childElementCount
            this.$el.addEventListener(
                'DOMNodeInserted',
                () => this.numCardElements = draggableElement.childElementCount
            )
            this.$el.addEventListener(
                'DOMNodeRemoved',
                () => this.numCardElements = draggableElement.childElementCount - 1
            )
        },
        components: {
            vueDraggable,
            Card
        },
    };
</script>
<style scoped>
    .wrapper {
        position: relative;
    }

    .wrapper, .card-container {
        width: 100%;
        height: 100%
    }
</style>
