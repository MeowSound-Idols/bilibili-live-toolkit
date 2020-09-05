import { Module, VuexModule, Mutation } from "vuex-module-decorators";

@Module
export default class GlobalModule extends VuexModule {
    isConnected = false;
    connectedRoomId?: number;

    @Mutation
    setConnectStatus(status: boolean) {
        this.isConnected = status;
    }

    @Mutation
    setConnectedRoomId(roomId: number) {
        this.connectedRoomId = roomId;
    }
}
