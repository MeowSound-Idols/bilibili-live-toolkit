import { EventEmitter } from "events";
import axios from "axios";
import BilibiliClient from "./clients/bilibili";
import log from "electron-log";
import { Transform } from "stream";
const { DanmuAutoParseStream } = require("danmulive");

export interface DanmukuEvent {
    type: "danmu" | "qirenzhi" | "connected";
    value: DanmukuEventValue;
}

export interface DanmukuEventValue {
    cmd: "DANMU_MSG" | "SEND_GIFT";
    info: any;
    data: any;
}

class DanmakuService extends EventEmitter {
    roomId?: number;
    danmakuParser?: Transform;
    danmakuProvider?: BilibiliClient;
    isConnected = false;
    constructor() {
        super();
    }
    async connect(roomId: number) {
        this.danmakuParser = new DanmuAutoParseStream();
        this.roomId = await DanmakuService.getRoomId(roomId);
        this.danmakuProvider = new BilibiliClient(
            this.roomId,
            this.danmakuParser!
        );
        this.danmakuProvider.connect();
        this.danmakuProvider.on("end", () => {
            log.debug("服务器主动断开连接 尝试重连");
            this.connect(roomId);
        });
        this.danmakuProvider.on("close", hadError => {
            if (hadError) {
                log.debug("由于网络错误断开连接 尝试重连");
                this.connect(roomId);
            } else {
                log.debug("连接断开");
            }
        });
        this.danmakuProvider.on("error", error => {
            log.debug("由于解析错误断开连接 尝试重连");
            this.connect(roomId);
        });
        this.danmakuParser!.on("data", (data: DanmukuEvent) => {
            log.debug(`弹幕信息：${JSON.stringify(data)}`);
            if (data.type === "danmu") {
                this.emit("danmaku", data);
            }
            if (data.type === "qirenzhi") {
                this.emit("popularity", data);
            }
            if (data.type === "connected") {
                this.emit("connected");
            }
        });
        this.isConnected = true;
    }

    disconnect() {
        this.danmakuProvider?.disconnect();
        this.danmakuProvider?.removeAllListeners("end");
        this.danmakuProvider?.removeAllListeners("close");
        this.danmakuProvider?.removeAllListeners("error");
        this.isConnected = false;
    }

    /**
     * Bilibili直播房间短号解析
     * @param roomId
     * @return 真实房间号
     */
    static async getRoomId(roomId: number): Promise<number> {
        if (roomId < 10000) {
            // 短号
            const roomInfo = (
                await axios.get(
                    `https://api.live.bilibili.com/room/v1/Room/get_info?id=${roomId}`
                )
            ).data;
            return roomInfo.data.room_id;
        }
        return roomId;
    }
}

export default DanmakuService;
