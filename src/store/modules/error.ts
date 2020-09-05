import { Module, VuexModule, Mutation } from "vuex-module-decorators";

@Module
export default class ErrorModule extends VuexModule {
    show = false;
    message = "";

    @Mutation
    showError(message: string) {
        this.show = true;
        this.message = message;
    }

    @Mutation
    hideError() {
        this.show = false;
    }
}
