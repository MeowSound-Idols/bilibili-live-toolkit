import axios from "axios";
import * as net from "net";
import { Transform } from "stream";
import { EventEmitter } from "events";
import log from "electron-log";

export interface DanmakuServerInfo {
    host: string;
    port: number;
    token: string;
}

export class AlreadyConnectedError extends Error {}
export class LostConnectionError extends Error {}

export const DM_MSG_POPULARITY = 2;
export const DM_MSG_PLAYER_COMMAND = 4;
export const DM_MSG_JOIN_COMMAND = 7;

export type DM_MSG_POPULARITY = typeof DM_MSG_POPULARITY;
export type DM_MSG_PLAYER_COMMAND = typeof DM_MSG_PLAYER_COMMAND;
export type DM_MSG_JOIN_COMMAND = typeof DM_MSG_JOIN_COMMAND;

export type DanmakuActions =
    | DM_MSG_POPULARITY
    | DM_MSG_PLAYER_COMMAND
    | DM_MSG_JOIN_COMMAND;

class BilibiliClient extends EventEmitter {
    roomId: number;
    transformer: Transform;
    socketClient?: net.Socket;
    isConnected = false;
    heartbeatTimer?: NodeJS.Timeout;

    constructor(roomId: number, transformer: Transform) {
        super();
        this.roomId = roomId;
        this.transformer = transformer;
    }

    async connect() {
        if (this.isConnected) {
            throw new AlreadyConnectedError();
        }
        log.debug(`连接弹幕服务器 roomId = ${this.roomId}`);
        this.isConnected = true;
        const { host, port, token } = await BilibiliClient.getDanmakuServerInfo(
            this.roomId
        );
        log.debug(`连接弹幕服务器 ${host}:${port} / token = ${token}`);
        this.socketClient = new net.Socket();
        this.socketClient.connect(port, host, () => {
            const handshakePayload = {
                roomid: this.roomId,
                uid: 0,
                protover: 2,
                token: token,
                platform: "biliroku"
            };
            this.send(DM_MSG_JOIN_COMMAND, JSON.stringify(handshakePayload));
            this.heartbeatTimer = setInterval(() => {
                this.isConnected && this.send(DM_MSG_POPULARITY);
            }, 30000);
            this.socketClient!.pipe(this.transformer);
        });
        this.socketClient.on("end", () => {
            this.isConnected = false;
            this.clean();
            this.emit("end");
        });
        this.socketClient.on("close", hadError => {
            this.isConnected = false;
            this.clean();
            this.emit("close", hadError);
        });
        this.socketClient.on("error", error => {
            this.isConnected = false;
            this.socketClient?.destroy();
            this.clean();
            this.emit("error", error);
        });
    }

    disconnect() {
        if (!this.isConnected || !this.socketClient) {
            throw new LostConnectionError();
        }
        log.debug("主动断开连接");
        this.isConnected = false;
        this.socketClient.end();
        this.clean();
    }

    private clean() {
        if (this.socketClient) {
            this.socketClient.unpipe();
            this.socketClient.removeAllListeners("end");
            this.socketClient.removeAllListeners("close");
            this.socketClient.removeAllListeners("error");
        }
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }
    }

    /**
     * Send data via socket
     * @param action
     * @param body
     */
    private send(action: DanmakuActions, body = "") {
        if (!this.isConnected || !this.socketClient) {
            throw new LostConnectionError();
        }
        log.debug(`Send > ${action} ${body}`);
        const headerLength = 16;
        const protoVersion = 2;
        const param = 1;

        const payload = Buffer.from(body, "utf-8");

        const packetLength = headerLength + payload.length;
        const sendBuffer = Buffer.alloc(packetLength);

        sendBuffer.writeInt32BE(packetLength, 0); //0~3字节 包长度
        sendBuffer.writeInt16BE(headerLength, 4); //4~5字节 头部长度
        sendBuffer.writeInt16BE(protoVersion, 6); //6~7字节 协议版本号 当前为 2
        sendBuffer.writeInt32BE(action, 8); //8~11字节 操作命令
        sendBuffer.writeInt32BE(param, 12); //12~15字节 操作命令参数（sub命令）

        if (payload.length > 0) {
            payload.copy(sendBuffer, 16);
        }

        this.socketClient.write(sendBuffer);
    }

    /**
     * 获得弹幕服务器信息
     * @param roomId 真实房间号（不支持短号）
     */
    static async getDanmakuServerInfo(
        roomId: number
    ): Promise<DanmakuServerInfo> {
        const serverInfo = (
            await axios.get(
                `https://api.live.bilibili.com/room/v1/Danmu/getConf?room_id=${roomId}`
            )
        ).data;
        return {
            host: serverInfo.data.host,
            port: parseInt(serverInfo.data.port),
            token: serverInfo.data.token
        };
    }
}

export default BilibiliClient;
