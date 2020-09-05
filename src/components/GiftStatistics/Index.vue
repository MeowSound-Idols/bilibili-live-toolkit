<template>
    <v-card tile style="min-height: calc(80vh - 265px)">
        <v-card-title
            >{{ $vuetify.lang.t("$vuetify.giftStatistics.cardTitle") }}
            <v-spacer />
            <v-btn text small color="light-blue darken-4" @click="reset">{{
                $vuetify.lang.t("$vuetify.giftStatistics.resetBtnText")
            }}</v-btn>
        </v-card-title>
        <v-card-text>
            <v-simple-table height="calc(80vh - 344px)" fixed-header>
                <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-left">
                                {{
                                    $vuetify.lang.t(
                                        "$vuetify.giftStatistics.giftName"
                                    )
                                }}
                            </th>
                            <th class="text-left">
                                {{
                                    $vuetify.lang.t(
                                        "$vuetify.giftStatistics.amount"
                                    )
                                }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in giftItems" :key="item.giftName">
                            <td>{{ item.giftName }}</td>
                            <td>{{ item.amount }}</td>
                        </tr>
                    </tbody>
                </template>
            </v-simple-table>
        </v-card-text>
    </v-card>
</template>
<script lang="ts">
import Vue from "vue";
import { ipcRenderer } from "electron";

export interface Gifts {
    [index: string]: number;
}

export default Vue.extend({
    data: () => ({
        gifts: {} as Gifts
    }),
    computed: {
        giftItems() {
            return Object.entries(this.gifts)
                .map(entry => {
                    const [giftName, amount] = entry;
                    return {
                        giftName,
                        amount
                    };
                })
                .sort((a, b) => b.amount - a.amount);
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
            if (cmd === "SEND_GIFT") {
                // 礼物
                const giftName = data.value.data.giftName as string;
                if (this.gifts[giftName] === undefined) {
                    this.gifts = {
                        ...this.gifts,
                        [giftName]: 0
                    };
                }
                this.gifts[giftName] += data.value.data.num;
            }
        },
        reset() {
            this.gifts = {};
        }
    }
});
</script>
