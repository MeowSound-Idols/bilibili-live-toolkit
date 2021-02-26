import { Module, VuexModule, Mutation } from "vuex-module-decorators";
import Storage from "@/services/storage";

@Module
export default class Danmaku extends VuexModule {
    /** 过滤银瓜子礼物 */
    filterSilverCoinGifts = Storage.getSetting(
        "danmaku.filterSilverCoinGifts",
        true
    );

    /** 隐藏粉丝牌子 */
    hideUserMedal = Storage.getSetting<boolean>("danmaku.hideUserMedal", false);

    /** 仅显示本房间牌子 */
    hideOtherRoomMedal = Storage.getSetting<boolean>(
        "danmuku.hideOtherRoomMedal",
        false
    );

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

    @Mutation
    updateHideOtherRoomMedal(value: boolean) {
        this.hideOtherRoomMedal = value;
        Storage.setSetting("danmuku.hideOtherRoomMedal", value);
    }
}
