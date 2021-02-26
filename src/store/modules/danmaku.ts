import { Module, VuexModule, Mutation } from "vuex-module-decorators";
import Storage from "@/services/storage";

@Module
export default class Danmaku extends VuexModule {
    filterSilverCoinGifts = Storage.getSetting(
        "danmaku.filterSilverCoinGifts",
        true
    );

    hideUserMedal = Storage.getSetting<boolean>("danmaku.hideUserMedal", false);

    @Mutation
    updateFilterSilverCoinGifts(value: boolean) {
        this.filterSilverCoinGifts = value;
        Storage.setSetting("danmaku.filterSilverCoinGifts", value);
    }

    @Mutation
    updateHideUserMedal(value: boolean) {
        this.hideUserMedal = value;
        Storage.setSetting("danmaku.hideUserMedal", value);
    }
}
