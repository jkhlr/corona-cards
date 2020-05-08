import Vue from "vue";
import VueRouter from "vue-router";
import Match from "./views/Match.vue";

Vue.use(VueRouter);

export default new VueRouter({
    routes: [
        {
            path: "/match/:matchId?",
            name: "Match",
            component: Match,
            props: true,
            alias: "/"
        },
        {
            path: "/about",
            name: "About",
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () =>
                import(/* webpackChunkName: "about" */ "./views/About.vue")
        }
    ]
});
