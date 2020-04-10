<template>
    <div class="card">
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
            altText() {
                if(this.face === '*') {
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
        }
    };
</script>

<style scoped>
    .card {
        flex-shrink: 0;
        position: relative;
    }

    .card img {
        display: block;
        width: var(--card-width);
        height: var(--card-height);
    }
</style>
