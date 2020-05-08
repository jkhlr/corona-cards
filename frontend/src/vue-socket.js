import Vue from "vue";
import VueSocketIO from 'vue-socket.io'
import store from "./store";
import socket from "./socket"

const vueSocket = new VueSocketIO({
    debug: process.env.NODE_ENV !== 'production',
    connection: socket,
    vuex: {
        store,
        actionPrefix: 'SOCKET_'
    }
});

Vue.use(vueSocket);
