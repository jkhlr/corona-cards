<template>
    <div class="card" @click="onClick" :class="{highlighted: isHighlighted}" :card-id="id">
        <img :src="imagePath" :alt="altText"/>
    </div>
</template>

<script>
    export default {
        name: "Card",
        props: ['face', 'id'],
        computed: {
            rank() {
                return this.face.substr(0, this.face.length - 1)
            },
            suit() {
                return this.face.charAt(this.face.length - 1)
            },
            isHighlighted() {
                return this.$store.getters.lastMoveCardId === this.id;
            },
            altText() {
                if (this.face === '*') {
                    return '*'
                }
                return `${this.rank}${this.suit}`
            },
            imagePath() {
                if (this.face === '*') {
                    return require(`@/assets/cards/back.png`)
                }
                if (this.rank === 'A' && this.suit === 'D') {
                    return require(`@/assets/cards/unblock.png`)
                }
                return require(`@/assets/cards/${this.rank}${this.suit}.png`)
            }
        },
        methods: {
            onClick() {
                this.$emit('click', this.id);
            }
        },
    };
</script>

<style scoped>
    .card {
        flex-shrink: 0;
        position: relative;
        border: var(--card-border) solid black;
        border-radius: 5px;
        overflow: hidden;
        box-sizing: border-box;
    }

    .card img {
        display: block;
        width: calc(var(--card-width) - 2 * var(--card-border));
        height: calc(var(--card-height) - 2 * var(--card-border));
        box-shadow: inset 100px 100px white
    }

    .card.highlighted {
        box-shadow: 0 0 3px 1px brown;
        background: brown
    }
</style>
