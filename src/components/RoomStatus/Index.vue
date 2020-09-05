<template>
    <v-card tile>
        <v-card-title>
            {{ $vuetify.lang.t("$vuetify.roomStatus.cardTitle") }}
            <v-spacer />
            <v-btn text small color="light-blue darken-4" @click="reset">{{
                $vuetify.lang.t("$vuetify.roomStatus.resetBtnText")
            }}</v-btn>
        </v-card-title>
        <v-card-text>
            <div class="room-status-container">
                <v-flex xs5>
                    <div class="room-status-block">
                        <div class="room-status-label">气人值</div>
                        <div v-if="!isConnected" class="not-connected">
                            {{
                                $vuetify.lang.t(
                                    "$vuetify.roomStatus.notConnected"
                                )
                            }}
                        </div>
                        <div class="room-status-data" v-else>
                            <animated-number
                                :value="popularity"
                                :round="true"
                                :duration="500"
                            />
                        </div>
                    </div>
                </v-flex>
                <v-flex xs7>
                    <div class="room-status-block">
                        <div class="room-status-label">直播收益</div>
                        <div class="room-status-data">
                            <animated-number
                                :value="revenue"
                                :round="true"
                                :duration="500"
                            />
                        </div>
                    </div>
                </v-flex>
            </div>
        </v-card-text>
    </v-card>
</template>
<style lang="less" scoped>
.not-connected {
    font-size: smaller;
    font-style: italic;
}
.room-status-container {
    display: flex;
}
.room-status-block {
    display: flex;
    flex-direction: column;
}
.room-status-label {
    padding: 5px 0;
}
.room-status-data {
    padding: 5px 0;
    font-size: xx-large;
    font-weight: bold;
    font-family: sans-serif;
}
</style>
<script lang="ts">
import Vue from "vue";
import { ipcRenderer } from "electron";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AnimatedNumber = require("animated-number-vue");

export default Vue.extend({
    data: () => ({
        popularity: 0,
        revenue: 0
    }),
    computed: {
        isConnected(): boolean {
            return this.$store.state.global.isConnected;
        }
    },
    mounted() {
        ipcRenderer.on("danmaku-popularity", (event, data) => {
            this.handlePopularityChange(data);
        });
        ipcRenderer.on("danmaku-message", (event, data) => {
            this.handleNewDanmaku(data);
        });
    },
    methods: {
        handlePopularityChange(data: { value: number }) {
            this.popularity = data.value;
        },
        handleNewDanmaku(data: any) {
            const cmd = data.value.cmd;
            if (cmd === "SEND_GIFT") {
                // 礼物
                const giftName = data.value.data.giftName;
                if (giftName === "辣条") {
                    return;
                }
                if (data.value.data.total_coin > 0) {
                    this.revenue += data.value.data.total_coin;
                }
            } else if (cmd === "SUPER_CHAT_MESSAGE") {
                // Superchat
                this.revenue += data.value.data.price * 1000;
            } else if (cmd === "GUARD_BUY") {
                // 上舰
                this.revenue += data.value.data.price;
            }
        },
        reset() {
            this.revenue = 0;
        }
    },
    components: {
        AnimatedNumber
    }
});
</script>
