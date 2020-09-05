import { get, set } from "lodash";
export default class Storage {
    static getSetting<T>(
        name: string,
        defaultValue: string | boolean | number | undefined
    ): T {
        const settings = localStorage.getItem("settings")
            ? JSON.parse(localStorage.getItem("settings") as string)
            : {};
        return get(settings, name) === undefined
            ? defaultValue
            : get(settings, name);
    }
    static setSetting(
        name: string,
        value: string | boolean | number | undefined
    ) {
        const settings = localStorage.getItem("settings")
            ? JSON.parse(localStorage.getItem("settings") as string)
            : {};
        set(settings, name, value);
        localStorage.setItem("settings", JSON.stringify(settings));
    }
    static deleteSetting(name: string) {
        Storage.setSetting(name, undefined);
    }
}
