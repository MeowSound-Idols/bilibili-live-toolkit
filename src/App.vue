<template>
    <v-app>
        <v-snackbar
            v-model="showError"
            color="error"
            :top="true"
            :timeout="5000"
        >
            {{ $store.state.error.message }}
            <v-btn dark text @click="$store.commit('hideError')">×</v-btn>
        </v-snackbar>
        <v-content>
            <keep-alive>
                <router-view />
            </keep-alive>
        </v-content>
    </v-app>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    name: "App",
    data: () => ({
        //
    }),
    computed: {
        showError: {
            get() {
                return this.$store.state.error.show;
            },
            set(v: boolean) {
                if (!v) {
                    this.$store.commit("hideError");
                }
            }
        }
    }
});
</script>
