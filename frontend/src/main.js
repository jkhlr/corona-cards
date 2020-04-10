import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueSocketIO from "vue-socket.io";

Vue.config.productionTip = false;

Vue.use(
    new VueSocketIO({
        debug: true,
        connection: '/',
        options: {path: "/ws/socket.io"}
    })
);

new Vue({
    router,
    render: h => h(App)
}).$mount("#app");
