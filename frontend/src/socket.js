import Vue from "vue";
import VueSocketIO from 'vue-socket.io'

const vueSocket = new VueSocketIO({
    debug: process.env.NODE_ENV !== 'production',
    connection: '/',
    options: {path: "/ws/socket.io"}
});

Vue.use(vueSocket);

const socket = vueSocket.io;
export default socket
