export default {
    methods: {
        endMove({from: fromElem, to: toElem, item: cardElem, newIndex, oldIndex}) {
            const from = fromElem.__vue__.$parent;
            const to = toElem.__vue__.$parent;
            const card = cardElem.__vue__;
            this.$emit('card-move', {card, from, to, oldIndex, newIndex});
        },
        checkMove({from: fromElem, to: toElem, dragged: cardElem, draggedContext: {futureIndex: index}}) {
            const from = fromElem.__vue__.$parent;
            const to = toElem.__vue__.$parent;
            const card = cardElem.__vue__;
            if (from === to) {
                return to.canMoveCardAt(card, index)
            }
            return to.canAddCardAt(card, index);
        },
        canAddCardAt() {
            return true
        },
        canMoveCardAt() {
            return true
        }

    },
}
