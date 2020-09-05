<template>
    <v-container class="lang-zh">
        <v-layout row wrap>
            <v-flex xs4>
                <v-card class="index-cards" tile>
                    <v-card-title>
                        {{ $vuetify.lang.t("$vuetify.index.connectTitle") }}
                    </v-card-title>
                    <v-card-text>
                        <h3></h3>
                        <v-form>
                            <v-text-field
                                v-model="roomId"
                                :label="
                                    $vuetify.lang.t(
                                        '$vuetify.index.roomIdInputPlaceholder'
                                    )
                                "
                            />
                        </v-form>
                        <v-btn
                            :color="connectBtnColor"
                            tile
                            @click="handleConnectButtonClicked"
                            :loading="connecting"
                        >
                            {{ connectBtnText }}
                        </v-btn>
                    </v-card-text>
                </v-card>
                <room-status class="index-cards" />
                <gift-statistics class="index-cards" />
            </v-flex>
            <v-flex xs4>
                <danmaku-list class="index-cards" />
            </v-flex>
            <v-flex xs4>
                <v-card class="index-cards" tile>
                    <v-card-text>
                        <v-btn @click="openNewWindow" text color="primary">
                            {{
                                $vuetify.lang.t("$vuetify.index.openNewWindow")
                            }}
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<style lang="less">
body {
    padding: 0px;
    margin: 0px;
    overflow: hidden;
}
.index-cards {
    margin: 10px;
}
.lang-zh {
    font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica,
        "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC",
        "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC",
        "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei",
        "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp",
        sans-serif;
}
</style>
<script lang="ts">
import Vue from "vue";
import { ipcRenderer } from "electron";
import RoomStatus from "./RoomStatus/Index.vue";
import DanmakuList from "./DanmakuList/Index.vue";
import GiftStatistics from "./GiftStatistics/Index.vue";
export default Vue.extend({
    data: () => ({
        roomId: "",
        connecting: false
    }),
    computed: {
        connectBtnText(): string {
            return this.isConnected
                ? this.$vuetify.lang.t("$vuetify.index.disconnectBtnText")
                : "LINK START!";
        },
        connectBtnColor(): string {
            return this.isConnected ? "error" : "primary";
        },
        isConnected(): boolean {
            return this.$store.state.global.isConnected;
        }
    },
    mounted() {
        const connectStatus = ipcRenderer.sendSync("check-connection");
        if (connectStatus.isConnected) {
            this.roomId = connectStatus.roomId;
            this.$store.commit("setConnectStatus", true);
            this.$store.commit("setConnectedRoomId", +this.roomId);
        }
    },
    methods: {
        handleConnectButtonClicked(): void {
            if (this.isConnected) {
                this.disconnect();
            } else {
                this.connect();
            }
        },
        connect(): void {
            if (!this.roomId) {
                throw new Error("请输入房间号");
            }
            this.connecting = true;
            ipcRenderer.send("connect", parseInt(this.roomId));
            ipcRenderer.once("connect-success", () => {
                this.connecting = false;
                this.$store.commit("setConnectStatus", true);
                this.$store.commit("setConnectedRoomId", +this.roomId);
            });
            ipcRenderer.once("connect-error", (event, error) => {
                this.$store.commit("showError", error.message);
                this.connecting = false;
            });
        },
        disconnect(): void {
            ipcRenderer.send("disconnect");
            this.$store.commit("setConnectStatus", false);
        },
        openNewWindow() {
            ipcRenderer.send("open-new-window");
        }
    },
    errorCaptured(err) {
        if (err.message) {
            this.$store.commit("showError", err.message);
        }
    },
    components: {
        RoomStatus,
        DanmakuList,
        GiftStatistics
    }
});
</script>
