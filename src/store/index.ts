import Vue from "vue";
import Vuex from "vuex";
import error from "./modules/error";
import global from "./modules/global";
import danmaku from "./modules/danmaku";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {},
    mutations: {},
    actions: {},
    modules: {
        error,
        global,
        danmaku
    }
});
