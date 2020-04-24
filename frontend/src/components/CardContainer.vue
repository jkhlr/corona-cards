<template>
    <div class="card-container">
        <vue-draggable
                ref="cards"
                class="cards"
                :class="display"
                :value="cards"
                @end="endDrag"
                :move="checkDrag"
                group="cards"
                filter=".non-movable"
                :delay="125"
                :delayOnTouchOnly="true"
                :componentData="componentData"
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
                    width: undefined,
                    height: undefined
                },
                numCardElements: undefined
            }
        },
        props: {
            slug: {
                type: String,
                required: true
            },
            display: {
                type: String,
                required: true
            }
        },
        computed: {
            cards() {
                return this.$store.state.gameState.cards[this.slug]
            },
            config() {
                return this.$store.state.gameState.config[this.slug]
            },
            cardWidth() {
                return this.$store.state.cardSize.width;
            },
            overlapWidth() {
                return this.calculateOverlap(this.size.width, this.cardWidth, this.numCardElements)
            },
            overlapHeight() {
                return this.calculateOverlap(this.size.height, this.cardWidth, this.numCardElements)
            },
            componentData() {
                return {
                    attrs: {
                        slug: this.slug,
                        style: `--overlap-width: ${this.overlapWidth}; --overlap-height: ${this.overlapHeight}`
                    }
                }
            }
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
                const fromSlug = from.attributes['slug'].value;
                const toSlug = to.attributes['slug'].value;
                const cardId = parseInt(item.attributes['card-id'].value)
                if (fromSlug !== toSlug || oldIndex !== newIndex) {
                    this.$store.commit('moveCard', {cardId, fromSlug, toSlug, newIndex});
                }
            },
            checkDrag({from, to, dragged, draggedContext: {index: oldIndex, futureIndex: newIndex}}) {
                const fromSlug = from.attributes['slug'].value;
                const toSlug = to.attributes['slug'].value;
                const cardId = parseInt(dragged.attributes['card-id'].value)
                if (fromSlug === toSlug && oldIndex === newIndex) {
                    return true
                }
                return this.$store.getters.canMove({cardId, fromSlug, toSlug, newIndex});
            },
            clickCard(cardId) {
                const currentSeatNumber = this.$store.state.gameState.currentPlayer.seatNumber
                const currentSeatSlug = `seat-${currentSeatNumber}`;
                const currentStashSlug = `stash-${currentSeatNumber}`;
                const isCurrentStashShown = this.$store.getters.isStashShown(currentSeatSlug)
                const fromSlug = this.slug;
                const newIndex = null;
                if (this.slug === currentSeatSlug) {
                    const firstOpenSlotSlug = this.$store.getters.firstOpenSlotSlug
                    this.tryMoveCard({toSlug: firstOpenSlotSlug, cardId, fromSlug, newIndex})
                } else if (this.slug.startsWith('slot-') && currentSeatNumber !== null) {
                    if (isCurrentStashShown) {
                        this.tryMoveCard({toSlug: currentStashSlug, cardId, fromSlug, newIndex})
                    } else {
                        this.tryMoveCard({toSlug: currentSeatSlug, cardId, fromSlug, newIndex});
                    }
                } else if (this.slug.startsWith('stash-')) {
                    this.tryFlipCard({cardId, containerSlug: this.slug})
                }
            },
            tryMoveCard({cardId, fromSlug, toSlug, newIndex}) {
                if (this.$store.getters.canMove({cardId, fromSlug, toSlug, newIndex})) {
                    this.$store.commit('moveCard', {cardId, fromSlug, toSlug, newIndex});
                }
            },
            tryFlipCard({cardId, containerSlug}) {
                if (this.$store.getters.canFlip({cardId, containerSlug})) {
                    this.$store.commit('flipCard', {cardId, containerSlug});
                }
            },
            calculateOverlap(containerSize, elementSize, numElements) {
                const overlap = (numElements * elementSize - containerSize) / ((numElements - 1) * elementSize)
                if (Number.isNaN(overlap)) {
                    return 1
                } else if (overlap < 0.5) {
                    return 0.5
                }
                return overlap
            }
        },
        mounted() {
            this.$refs.resizeObserver.compareAndNotify()
            const cards = this.$refs.cards.$el
            this.numCardElements = cards.childElementCount
            this.$el.addEventListener(
                'DOMNodeInserted',
                () => this.numCardElements = cards.childElementCount
            )
            this.$el.addEventListener(
                'DOMNodeRemoved',
                () => this.numCardElements = cards.childElementCount - 1
            )
        },
        components: {
            vueDraggable,
            Card
        },
    };
</script>
<style scoped>
    .card-container {
        position: relative;
        width: 100%;
        height: 100%
    }

    .cards {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;

        --overlap-width: 1;
        --overlap-height: 1;
    }

    .cards.stack .card {
        width: var(--card-width);
        height: var(--card-height);
        margin-right: calc(-1 * var(--card-width));
    }

    .cards.stack .card:first-child {
        margin-left: calc(-1 * var(--card-width));
    }

    .cards.fan:not(.vertical) .card {
        width: var(--card-width);
        height: var(--card-height);
        margin-right: calc(-1 * var(--card-width) * var(--overlap-width));
    }

    .cards.fan:not(.vertical) .card:first-child {
        margin-left: calc(-1 * var(--card-width) * var(--overlap-width));
    }

    .cards.fan.vertical {
        flex-direction: column;
    }

    .cards.fan.vertical .card {
        width: var(--card-height);
        height: var(--card-width);
        margin-bottom: calc(-1 * var(--card-width) * var(--overlap-height));
    }

    .cards.fan.vertical .card:first-child {
        margin-top: calc(-1 * var(--card-width) * var(--overlap-height));
    }

    .cards.fan.vertical .card >>> img {
        transform: rotate(90deg);
        transform-origin: calc(var(--card-height) / 2) calc(var(--card-height) / 2);
    }
</style>
