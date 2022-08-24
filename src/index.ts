import {
    ConfigServer,
    ConfigGithub,
    ConfigBitbucket,
    ConfigGitlab,
    supportableCVS
} from "./util/types";
import ConfigFactory from "./util/ConfigFactory";
import { SoundManager } from "./util/SoundManager";
import express from "express";
import Listener from "./listeners/Listener";
import GitListener from "./listeners/GithubListener";
import BitbucketListener from "./listeners/BitbucketListener";
import GitlabListener from "./listeners/GitlabListener";
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
        let listener: Listener;
        if (config_server.getProperty("cvs") === "github") {
            listener = new GitListener(
                cvs_config.getAllProperties() as ConfigGithub,
                config_server.getAllProperties() as ConfigServer 
            );
        } else if (config_server.getProperty("cvs") === "bitbucket") {
            listener = new BitbucketListener(
                cvs_config.getAllProperties() as ConfigBitbucket,
                config_server.getAllProperties() as ConfigServer 
            );
        } else if (config_server.getProperty("cvs") === "gitlab") {
            listener = new GitlabListener(
                cvs_config.getAllProperties() as ConfigGitlab,
                config_server.getAllProperties() as ConfigServer 
            );
        } else throw new Error("Uknown CVS!");

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
