import {
    ConfigServer,
    ConfigGit,
    ConfigBitbucket,
    supportableCVS
} from "./util/types";
import ConfigFactory from "./util/ConfigFactory";
import { SoundManager } from "./SoundManager";
import express from "express";
import GitListener from "./GitListener";
import BitbucketListener from "./BitbucketListener";
import { getRandomInt, getBaseDir } from "./util/extra";
import notifier from "node-notifier";
import fs from "fs";

const config_server = new ConfigFactory("server", false);
config_server.checkValidation();
const cvs_config = new ConfigFactory(config_server.getProperty("cvs") as supportableCVS);
cvs_config.checkValidation();
const soundManager = new SoundManager(config_server.getProperty("volume") as number);
const base_dir = getBaseDir();

console.log(`Running with configs: ${JSON.stringify({
    ...config_server.getAllProperties(),
    ...cvs_config.getAllProperties()
}, null, "\t")}\n`);

function listen_new_commit() {
    return new Promise(resolve => {
        const listener = config_server.getProperty("cvs") === "git" ? 
            new GitListener(
                cvs_config.getAllProperties() as ConfigGit,
                config_server.getAllProperties() as ConfigServer 
            ) :
            new BitbucketListener(
                cvs_config.getAllProperties() as ConfigBitbucket,
                config_server.getAllProperties() as ConfigServer 
            );

        const start = async () => {
            const isSound = await listener.isSoundNewCommit();
            console.log("is sound:", isSound);
            if (isSound) {
                soundManager.play(`meow${getRandomInt(1, 3)}.mp3`);
                notification(
                    `New commit in ${listener.branch_name}!`, 
                    `Hurry up to pull the ${listener.branch_name}!`
                );
            }
            console.log("\n");
        };

        start();
        setInterval(start, config_server.getProperty("timer_interval") as number);
    });
}

const app = express();

app.listen(config_server.getProperty("port"), () => {
    console.log(`Listening at ${config_server.getProperty("port")}`);
    listen_new_commit();
});

function notification(title: string, message: string) {
    const base_dir_icons = `${base_dir}assets/icons/`;
    const icons_quantity = fs.readdirSync(base_dir_icons).length;
    const icon_path = `${base_dir_icons}cat${getRandomInt(1, icons_quantity)}.jpg`;
    notifier.notify({
        title,
        message,
        sound: false,
        icon: icon_path,
        wait: true
    }, (err: any, response: any) => {
        if (err) console.log("NOTIFICATION POPUP ERROR:", err);
    });
}
