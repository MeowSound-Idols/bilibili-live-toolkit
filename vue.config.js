const path = require("path");
module.exports = {
    transpileDependencies: ["vuetify"],
    devServer: {
        host: "127.0.0.1",
        disableHostCheck: true
    },
    chainWebpack: config => {
        config.resolve.alias.set("@", path.resolve("src"));
    },
    pluginOptions: {
        electronBuilder: {
            chainWebpackMainProcess: config => {
                // Chain webpack config for electron main process only
                config.mode("development");
            },
            builderOptions: {
                appId: "moe.sound.sora.bililivetoolkit",
                // asar: false,
                artifactName: "blt-${os}-${version}.${ext}",
                productName: "Bilibili Live Toolkit",
                win: {
                    target: ["portable"]
                },
                nsis: {
                    oneClick: false,
                    allowToChangeInstallationDirectory: true
                }
            }
        }
    }
};
