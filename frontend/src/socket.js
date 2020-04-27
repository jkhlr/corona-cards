import Vue from "vue";
import VueSocketIO from 'vue-socket.io'
import store from "./store";

const vueSocket = new VueSocketIO({
    debug: process.env.NODE_ENV !== 'production',
    connection: '/',
    options: {path: "/ws/socket.io"},
    vuex: {
        store,
        actionPrefix: 'SOCKET_'
    }
});

Vue.use(vueSocket);

const socket = vueSocket.io;
export default socket
