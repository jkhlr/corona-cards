<template>
    <div class="match">
        <div class="filler left"/>
        <div class="title">
            <div class="filler"/>
            <span>ConronaCards</span>
            <div class="filler"/>
        </div>
        <div class="menu-toggle">
            <div class="filler"/>
            <span v-if="showTable" @click="showTable = false">menu</span>
            <div class="filler"/>
        </div>

        <div v-if="showTable" class="content-wrapper table-wrapper">
            <Table/>
        </div>
        <div v-else class="content-wrapper">
            <div class="menu">
                <div @click="startGame('skat')">PLAY!</div>
            </div>
        </div>
    </div>
</template>

<script>
    import Table from "../components/Table.vue";
    import {randomName} from "../names";

    export default {
        name: "Match",
        data() {
            return {
                displayName: randomName(),
                showTable: false
            }
        },
        props: {
            matchId: {
                type: String,
                default: 'test-match'
            }
        },
        methods: {
            joinMatch() {
                console.log(`Joining match ${this.matchId} as ${this.displayName}.`);
                this.$store.dispatch('joinMatch', {matchId: this.matchId, displayName: this.displayName});
            },
            restartGame() {
                console.log('Restarting game.')
                this.$store.dispatch('startGame', {gameId: this.gameConfig.gameId})
            },
            startGame(gameId) {
                this.showTable = true;
                console.log(`Starting game: ${gameId}`)
                this.$store.dispatch('startGame', {gameId})
            },
        },
        mounted() {
            if (!this.$socket.connected) {
                this.$socket.connect()
            }
            this.joinMatch()
        },
        components: {
            Table
        }
    };
</script>

<style scoped>
    .match {
        height: 100%;
        display: grid;
        grid-template-rows: 1.5em 1fr;
        grid-template-columns: 1fr 5fr 1fr;
        grid-template-areas: "left title menu-toggle" "content content content";
        background: darkseagreen;
    }

    .content-wrapper {
        padding: 0 5px;
        box-sizing: border-box;
        grid-area: content;
    }

    .table-wrapper {
        overflow: hidden;
        height: 100%;
    }

    .title {
        grid-area: title;
        line-height: 1.5em;
        font-weight: bold;
        display: flex
    }

    .filler {
        border: 0;
        border-bottom: 2px solid white;
        height: calc(50% - 1px);
        flex-grow: 1
    }

    .left {
        grid-area: left
    }

    .menu-toggle {
        grid-area: menu-toggle;
        line-height: 1.5em;
        font-weight: bold;
        display: flex
    }

    .menu {
        padding-top: 5em;
        width: 10em;
        text-align: center;
        margin: auto;
    }

    .title span, .menu-toggle span {
        padding: 0 5px;
    }

</style>
