<template>
    <v-card tile>
        <v-card-title>{{
            $vuetify.lang.t("$vuetify.danmakuList.settings.settingsCardTitle")
        }}</v-card-title>
        <v-card-text>
            <v-form>
                <v-checkbox
                    v-model="filterSilverCoinGifts"
                    :label="
                        $vuetify.lang.t(
                            '$vuetify.danmakuList.settings.filterSilverCoinGifts'
                        )
                    "
                ></v-checkbox>
                <v-checkbox
                    v-model="hideUserMedal"
                    :label="
                        $vuetify.lang.t(
                            '$vuetify.danmakuList.settings.hideUserMedal'
                        )
                    "
                ></v-checkbox>
                <v-checkbox
                    v-model="hideOtherRoomMedal"
                    :label="
                        $vuetify.lang.t(
                            '$vuetify.danmakuList.settings.hideOtherRoomMedal'
                        )
                    "
                ></v-checkbox>
            </v-form>
        </v-card-text>
    </v-card>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    data: () => ({}),
    computed: {
        filterSilverCoinGifts: {
            get() {
                return this.$store.state.danmaku.filterSilverCoinGifts;
            },
            set(v: boolean) {
                this.$store.commit("updateFilterSilverCoinGifts", v);
            }
        },
        hideUserMedal: {
            get() {
                return this.$store.state.danmaku.hideUserMedal;
            },
            set(v: boolean) {
                this.$store.commit("updateHideUserMedal", v);
            }
        },
        hideOtherRoomMedal: {
            get() {
                return this.$store.state.danmaku.hideOtherRoomMedal;
            },
            set(v: boolean) {
                this.$store.commit("updateHideOtherRoomMedal", v);
            }
        }
    }
});
</script>
