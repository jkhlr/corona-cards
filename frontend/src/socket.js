import Vue from "vue";
import VueSocketIO from 'vue-socket.io'

const vueSocket = new VueSocketIO({
    debug: true,
    connection: '/',
    options: {path: "/ws/socket.io"}
});

Vue.use(vueSocket);

const socket = vueSocket.io;
export default socket
