"use strict";

import { app, protocol, BrowserWindow, ipcMain, webContents } from "electron";
import {
    createProtocol
    /* installVueDevtools */
} from "vue-cli-plugin-electron-builder/lib";
import DanmakuService from "./services/danmaku";
import log from "electron-log";

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { secure: true, standard: true } }
]);

app.disableHardwareAcceleration();

async function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
        if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
        createProtocol("app");
        // Load the index.html when not in development
        win.loadURL("app://./index.html");
    }
    try {
        await win.webContents.session.cookies.set({
            name: "kg_mid",
            value: "d8b438d814a0f4742242b4d723ff0aa7",
            url: "https://www.kugou.com/yy/index.php"
        });
    } catch (e) {
        log.error(e);
    }

    win.on("closed", () => {
        win = null;
    });
}

async function createNewWindow() {
    // Create the browser window.
    let win: BrowserWindow | null = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });

    try {
        await win.webContents.session.cookies.set({
            name: "kg_mid",
            value: "d8b438d814a0f4742242b4d723ff0aa7",
            url: "https://www.kugou.com/yy/index.php"
        });
    } catch (e) {
        log.error(e);
    }

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
        if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
        createProtocol("app");
        // Load the index.html when not in development
        win.loadURL("app://./index.html");
    }

    win.on("closed", () => {
        win = null;
    });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        //
    }
    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", data => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}
const danmakuInstance = new DanmakuService();

danmakuInstance.removeAllListeners("danmaku");
danmakuInstance.removeAllListeners("popularity");
danmakuInstance.on("danmaku", data => {
    webContents.getAllWebContents().forEach(content => {
        content.send("danmaku-message", data);
    });
});
danmakuInstance.on("popularity", data => {
    webContents.getAllWebContents().forEach(content => {
        content.send("danmaku-popularity", data);
    });
});

ipcMain.on("connect", async (event, roomId) => {
    if (danmakuInstance.isConnected) {
        danmakuInstance.disconnect();
    }
    try {
        await danmakuInstance.connect(roomId);
        danmakuInstance.once("connected", () => {
            event.reply("connect-success");
        });
    } catch (e) {
        log.error(e);
        event.reply("connect-error", e);
    }
});

ipcMain.on("disconnect", async (event, roomId) => {
    if (danmakuInstance.isConnected) {
        danmakuInstance.disconnect();
    }
});

ipcMain.on("check-connection", (event, arg) => {
    event.returnValue = {
        isConnected: danmakuInstance.isConnected,
        roomId: danmakuInstance.roomId
    };
});

ipcMain.on("open-new-window", () => {
    createNewWindow();
});

process.on("uncaughtException", function(error) {
    console.log(error.stack);
});
