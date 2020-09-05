export interface Danmaku {
    type: "danmu" | "qirenzhi" | "connected";
    value: DanmakuBody;
}

export interface DanmakuBody {
    cmd: "DANMU_MSG" | "SEND_GIFT";
}

export interface DanmakuMessage {}
