import Vue from "vue";
import Vuetify from "vuetify/lib";
import zh from "@/locale/zh";
import "@mdi/font/css/materialdesignicons.css";

Vue.use(Vuetify);

export default new Vuetify({
    lang: {
        locales: {
            zh
        },
        current: "zh"
    },
    icons: {
        iconfont: "mdi"
    }
});
