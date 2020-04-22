<template>
    <div
            class="card-seat"
            :class="{
                highlighted: isStashShown && isStashHighlighted || !isStashShown && isHighlighted,
                [orientation]: true
            }"
    >
        <span class="border-text player-name">NAME</span>
        <card-container v-if="isStashShown" :slug="stashSlug"   :display="`fan ${orientation}`"/>
        <card-container v-else              :slug="slug"        :display="`fan ${orientation}`"/>
        <span class="border-text stash-toggle" v-if="hasStash" @click="toggleStash">
            <a :class="{active: isStashShown}">stash</a>
            <span> | </span>
            <a :class="{active: !isStashShown}">hand</a>
        </span>
    </div>
</template>

<script>
    import CardContainer from "@/components/CardContainer";
    import {mapMutations} from "vuex";

    export default {
        name: "CardSeat",
        props: {
            slug: {
                type: String,
                required: true
            },
            orientation: {
                type: String,
                default: 'horizontal'
            }
        },
        computed: {
            isHighlighted() {
                return this.$store.getters.lastMoveFromSlug === this.slug
            },
            hasStash() {
                return this.$store.getters.hasStash(this.slug)
            },
            isStashShown() {
                return this.$store.getters.isStashShown(this.slug) === true
            },
            stashSlug() {
                const [_, seatNumber] = this.slug.split('-')
                return `stash-${seatNumber}`
            },
            isStashHighlighted() {
                return this.$store.getters.lastMoveFromSlug === this.stashSlug
            },
        },
        methods: {
            toggleStash() {
                this.$store.commit('toggleStash', this.slug)
            }
        },
        components: {
            CardContainer
        }
    };
</script>
<style scoped>
    .card-seat {
        border-radius: 5px;
        border: var(--card-container-border) solid white;
        padding: var(--card-container-padding);
        box-sizing: border-box;
        position: relative;
        width: 100%;
        height: 100%;
    }

    .card-seat.highlighted {
        box-shadow: 0 0 3px 1px brown
    }

    .card-seat .border-text {
        font-size: 12px;
        line-height: 10px;
        position: absolute;
        background: darkseagreen;
    }

    .card-seat .stash-toggle {
        padding: 0 3px;
        bottom: -5px;
        right: 10px;
    }

    .card-seat .stash-toggle .active {
        font-weight: bold;
    }

    .card-seat .player-name {
        padding: 0 3px;
        top: -5px;
        left: 10px;
    }
</style>
