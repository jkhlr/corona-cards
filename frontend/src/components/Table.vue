<template>
    <div class="test-table">
        <div class="seat-switch" @click="switchSeat">X</div>
        <card-fan
                class="bottom-seat"
                v-if="state.seats[0]"
                :cards="state.seats[0].cards"
                ref="seat-0"
                orientation="horizontal"
                @card-move="onCardMove"
        />
        <card-fan
                class="left-seat"
                v-if="state.seats[1]"
                :cards="state.seats[1].cards"
                ref="seat-1"
                orientation="vertical"
                @card-move="onCardMove"
        />

        <card-fan
                class="top-seat"
                v-if="state.seats[2]"
                :cards="state.seats[2].cards"
                ref="seat-2"
                orientation="horizontal"
                @card-move="onCardMove"
        />
        <card-fan
                class="right-seat"
                v-if="state.seats[3]"
                :cards="state.seats[3].cards"
                ref="seat-3"
                orientation="vertical"
                @card-move="onCardMove"
        />
        <card-stack
                class="left-stack"
                v-if="state.slots[0]"
                :cards="state.slots[0].cards"
                ref="slot-0"
                @card-move="onCardMove"
        />
        <card-stack
                class="right-stack"
                v-if="state.slots[1]"
                :cards="state.slots[1].cards"
                ref="slot-1"
                @card-move="onCardMove"
        />
        <!--        <div class="container">-->
        <!--           -->
        <!--        </div>-->
        <!--        <div class="container middle">-->
        <!--            <card-fan-->
        <!--                    v-if="state.seats[1]"-->
        <!--                    :cards="state.seats[1].cards"-->
        <!--                    ref="seat-1"-->
        <!--                    orientation="horizontal"-->
        <!--                    @card-move="onCardMove"-->
        <!--            />-->
        <!--            <br>-->
        <!--            <card-stack-->
        <!--                    v-if="state.slots[0]"-->
        <!--                    :cards="state.slots[0].cards"-->
        <!--                    ref="slot-0"-->
        <!--                    @card-move="onCardMove"-->
        <!--            />-->
        <!--            <card-stack-->
        <!--                    v-if="state.slots[1]"-->
        <!--                    :cards="state.slots[1].cards"-->
        <!--                    ref="slot-1"-->
        <!--                    @card-move="onCardMove"-->
        <!--            />-->

        <!--        </div>-->
        <!--        <div class="container right">-->
        <!--            <card-fan-->
        <!--                    v-if="state.seats[2]"-->
        <!--                    :cards="state.seats[2].cards"-->
        <!--                    ref="seat-2"-->
        <!--                    orientation="vertical"-->
        <!--                    @card-move="onCardMove"-->
        <!--            />-->
        <!--        </div>-->
    </div>
</template>

<script>
    import CardStack from "@/components/CardStack";
    import CardFan from "@/components/CardFan";

    export default {
        name: "Table",
        data() {
            return {
                state: {
                    seats: [],
                    slots: []
                },
                playerName: '',
                requestingMove: false,
                currentSeat: null
            }
        },
        sockets: {
            stateUpdate({state}) {
                if (!this.requestingMove) {
                    this.updateState(state)
                }
            },
            confirmMove({move, state}) {
                console.log(`Move confirmed: ${move}`);
                this.requestingMove = false;
                this.updateState(state)
            },
            rejectMove({error, state}) {
                console.log(`Move Request rejected: ${error}`);
                this.requestingMove = false;
                this.updateState(state)
            },
            remoteMove() {
                console.log(`Remote move, requesting state update.`);
                if (!this.requestingMove) {
                    this.getState()
                }
            }
        },
        methods: {
            requestMove(moveRequest) {
                console.log(`Move requested: ${moveRequest}`);
                this.$socket.emit('requestMove', moveRequest);
                this.requestingMove = true;
            },
            getState() {
                console.log('State update requested');
                this.$socket.emit('getState');
            },
            takeSeat(seatNumber) {
                console.log(`Seat ${seatNumber} taken`);
                this.$socket.emit('takeSeat', seatNumber);
            },

            updateState(state) {
                console.log(`State updated: ${JSON.stringify(state)}`);
                this.state = state
            },
            onCardMove({card, from, to, oldIndex, newIndex}) {
                const [fromType, fromNumber] = this.getRefSlug(from).split('-');
                const [toType, toNumber] = this.getRefSlug(to).split('-');
                let fromContainer;
                if (fromType === 'slot') {
                    fromContainer = this.state.slots[fromNumber]
                } else if (fromType === 'seat') {
                    fromContainer = this.state.seats[fromNumber]
                } else {
                    throw new TypeError(`Invalid type: ${fromType}`)
                }
                let toContainer;
                if (toType === 'slot') {
                    toContainer = this.state.slots[toNumber]
                } else if (toType === 'seat') {
                    toContainer = this.state.seats[toNumber]
                } else {
                    throw new TypeError(`Invalid type: ${toType}`)
                }

                fromContainer.cards = fromContainer.cards
                    .slice(0, oldIndex)
                    .concat(fromContainer.cards.slice(oldIndex + 1));
                toContainer.cards = toContainer.cards
                    .slice(0, newIndex)
                    .concat([{face: card.face, id: card.id}])
                    .concat(toContainer.cards.slice(newIndex));

                this.requestMove(
                    `move ${card.id} ${fromType}-${fromNumber} ${toType}-${toNumber} ${newIndex}`
                )
            },
            getRefSlug(component) {
                for (let [slug, c] of Object.entries(this.$refs)) {
                    if (c === component) {
                        return slug;
                    }
                }
                throw new TypeError(`Component has no ref slug: ${component}`)
            },
            switchSeat() {
                if (this.currentSeat === null) {
                    this.currentSeat = 0
                } else {
                    this.currentSeat = ((this.currentSeat + 1) % 4)
                }
            }
        },
        watch: {
            currentSeat() {
                this.takeSeat(this.currentSeat)
            }
        },
        created() {
            window.takeSeat = (seatNumber) => this.$socket.emit('takeSeat', seatNumber);
            this.$socket.emit('getState');
        },
        components: {
            CardStack,
            CardFan
        }
    }
</script>

<style scoped>
    .test-table {
        height: 100%;
        background: darkseagreen;
        padding: 10px;
        box-sizing: border-box;

        display: grid;
        grid-template-columns: var(--card-height) 1fr 1fr var(--card-height);
        grid-template-rows: var(--card-height) 1fr var(--card-height);
        align-items: center;
        column-gap: 10px;
        row-gap: 10px;

        --card-width: 60px;
        --card-height: 100px;
    }

    .seat-switch {
        position: absolute;
        top: 50%;
        left: 50%;
    }

    .left-seat {
        grid-column-start: 1;
        grid-column-end: 2;
        grid-row-start: 1;
        grid-row-end: 4;
    }

    .right-seat {
        grid-column-start: 4;
        grid-column-end: 5;
        grid-row-start: 1;
        grid-row-end: 4;
    }

    .top-seat {
        grid-column-start: 2;
        grid-column-end: 4;
        grid-row-start: 1;
        grid-row-end: 2;
    }

    .bottom-seat {
        grid-column-start: 2;
        grid-column-end: 4;
        grid-row-start: 3;
        grid-row-end: 4;
    }

    .left-stack {
        grid-column-start: 2;
        grid-column-end: 3;
        grid-row-start: 2;
        grid-row-end: 3;
    }

    .right-stack {
        grid-column-start: 3;
        grid-column-end: 4;
        grid-row-start: 2;
        grid-row-end: 3;
    }


    .container {
        display: flex;

        box-sizing: border-box;
        background: lightgrey;
        border: thin solid black;
        padding: 10px;
        height: 100%;
        flex-grow: 1;
    }

    .container.middle {
        flex-grow: 2;
        flex-direction: column;
    }

    .container.right {
        flex-direction: row-reverse;
    }
</style>
