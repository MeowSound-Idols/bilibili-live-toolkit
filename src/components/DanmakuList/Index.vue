<template>
    <v-card tile>
        <v-dialog v-model="settingsVisible" width="50vw">
            <settings />
        </v-dialog>
        <v-card-title
            >{{ $vuetify.lang.t("$vuetify.danmakuList.cardTitle") }}
            <v-spacer />
            <v-btn icon @click="settingsVisible = true">
                <v-icon>mdi-cog-outline</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-text>
            <div class="danmaku-container">
                <div
                    class="danmaku-item"
                    v-for="item in danmaku"
                    :key="item.timestamp.valueOf()"
                >
                    <template v-if="item.type === 'message'">
                        <div class="message">
                            <div
                                class="medal"
                                v-if="
                                    item.data.medalName && !updateHideUserMedal
                                "
                            >
                                <div class="name">
                                    {{ item.data.medalName }}
                                </div>
                                <div class="level">
                                    {{ item.data.medalLevel }}
                                </div>
                            </div>
                            <span class="user">{{ item.data.user }}</span>
                            <span class="content">
                                {{ item.data.content }}
                            </span>
                        </div>
                    </template>
                    <template v-if="item.type === 'gift'">
                        <div
                            class="gift"
                            :style="{
                                backgroundColor: getGiftBackgroundColor(
                                    item.data.price / 1000
                                )
                            }"
                        >
                            <span class="user">{{ item.data.user }}</span>
                            <span class="content">
                                送出 {{ item.data.giftName }} ×
                                {{ item.data.amount }}
                            </span>
                        </div>
                    </template>
                    <template v-if="item.type === 'superchat'">
                        <div
                            class="superchat"
                            :style="{
                                backgroundColor: getSuperchatBackgroundColor(
                                    item.data.price
                                )
                            }"
                        >
                            <div class="superchat-header">
                                <span class="user">{{ item.data.user }}</span>
                                <span class="price"
                                    >￥ {{ item.data.price }}</span
                                >
                            </div>
                            <div class="superchat-content">
                                {{ item.data.content }}
                            </div>
                        </div>
                    </template>
                    <template v-if="item.type === 'guard'">
                        <div
                            class="guard"
                            :style="{
                                backgroundColor: getGuardBackgroundColor(
                                    item.data.price / 1000
                                )
                            }"
                        >
                            <div class="superchat-header">
                                <span class="user">{{ item.data.user }}</span>
                            </div>
                            <div class="superchat-content">
                                购买 {{ item.data.giftName }} ×
                                {{ item.data.amount }}
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>
<style lang="less" scoped>
.danmaku-container {
    display: flex;
    flex-direction: column-reverse;
    height: 80vh;
    overflow: hidden;
}
.danmaku-item {
    -webkit-line-clamp: 2;
    vertical-align: middle;
    .medal {
        display: inline-flex;
        margin-right: 5px;
        background-color: #fff4e5;
        padding: 2px;

        .level {
            padding-left: 2px;
            font-size: 12px;
            line-height: 14px;
        }
    }
    .user {
        margin-right: 5px;
        white-space: nowrap;
    }
    .content {
        width: max-content;
        color: black;
    }
    .message {
        margin: 2px 0;
        padding: 2px;
    }
    .gift {
        margin: 2px 0;
        padding: 2px;
    }
    .superchat,
    .guard {
        padding: 2px;
        margin: 2px 0;
        .superchat-header {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            span {
                display: inline-block;
            }
        }
    }
    .guard {
    }
}
</style>
<script lang="ts">
import Vue from "vue";
import { ipcRenderer } from "electron";
import Settings from "./Settings.vue";

export interface ParsedDanmaku {
    type: string;
    data: object;
    timestamp: Date;
}

export default Vue.extend({
    data: () => ({
        danmaku: [
            {
                type: "message",
                data: {
                    user: "<system>",
                    content: "这里会显示弹幕列表哦~",
                    medalName: "粉丝牌",
                    medalLevel: "等级"
                },
                timestamp: new Date()
            }
        ] as ParsedDanmaku[],
        settingsVisible: false
    }),
    computed: {
        filterSilverCoinGifts() {
            return this.$store.state.danmaku.filterSilverCoinGifts;
        },
        updateHideUserMedal() {
            return this.$store.state.danmaku.hideUserMedal;
        }
    },
    mounted() {
        ipcRenderer.on("danmaku-message", (event, data) => {
            this.handleNewDanmaku(data);
        });
    },
    methods: {
        handleNewDanmaku(data: any) {
            const cmd = data.value.cmd;
            if (cmd.startsWith("DANMU_MSG")) {
                this.appendDanmaku({
                    type: "message",
                    data: {
                        user: data.value.info[2][1],
                        content: data.value.info[1],
                        medalName: data.value.info[3][1],
                        medalLevel: data.value.info[3][0],
                        medalRoomId: data.value.info[3][3]
                    },
                    timestamp: new Date()
                });
            } else if (cmd === "SEND_GIFT") {
                if (this.filterSilverCoinGifts) {
                    const giftName = data.value.data.giftName;
                    if (giftName === "辣条") {
                        return;
                    }
                }
                this.appendDanmaku({
                    type: "gift",
                    data: {
                        user: data.value.data.uname,
                        giftName: data.value.data.giftName,
                        amount: data.value.data.num,
                        price: data.value.data.total_coin
                    },
                    timestamp: new Date()
                });
            } else if (cmd === "SUPER_CHAT_MESSAGE") {
                this.appendDanmaku({
                    type: "superchat",
                    data: {
                        user: data.value.data.user_info.uname,
                        content: data.value.data.message,
                        price: data.value.data.price
                    },
                    timestamp: new Date()
                });
            } else if (cmd === "GUARD_BUY") {
                this.appendDanmaku({
                    type: "guard",
                    data: {
                        user: data.value.data.username,
                        giftName: data.value.data.gift_name,
                        amount: data.value.data.num,
                        price: data.value.data.price
                    },
                    timestamp: new Date()
                });
            }
        },
        appendDanmaku(danmaku: ParsedDanmaku) {
            this.danmaku.unshift(danmaku);
            if (this.danmaku.length > 200) {
                this.danmaku.pop();
            }
        },
        getSuperchatBackgroundColor(price: number) {
            if (price <= 30) {
                return "rgba(42, 96, 178, 0.1)";
            }
            if (price <= 50) {
                return "rgba(66, 125, 158, 0.1)";
            }
            if (price <= 100) {
                return "rgba(226, 181, 43, 0.1)";
            }
            if (price <= 500) {
                return "rgba(224, 148, 67, 0.1)";
            }
            if (price <= 1000) {
                return "rgba(229, 77, 77, 0.1)";
            }
            return "rgba(171,26,50, 0.1)";
        },
        getGiftBackgroundColor(price: number) {
            if (price > 500) {
                return "rgba(229, 77, 77, 0.1)";
            }
            if (price > 100) {
                return "rgba(224, 148, 67, 0.1)";
            }
            return null;
        },
        getGuardBackgroundColor(price: number) {
            if (price > 10000) {
                return "rgba(229, 77, 77, 0.3)";
            }
            if (price > 1000) {
                return "rgba(229, 77, 77, 0.1)";
            }
            if (price > 100) {
                return "rgba(67, 172, 224, 0.1)";
            }
            return null;
        }
    },
    components: {
        Settings
    }
});
</script>
