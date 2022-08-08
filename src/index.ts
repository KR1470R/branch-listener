import { getGitBranchURL, getRandomInt } from "./util/extra";
import { axios_config_git } from "./util/globals";
import { ConfigServer, ConfigGit, ConfigBitbucket } from "./util/types";
import axios from "axios";
import player from "node-wav-player";
import express from "express";

const default_config = new JSONManager("./configs/default_config.json").content as Config;
const user_config = new JSONManager("./configs/user_config.json").content as Config;

if (!user_config || Object.keys(user_config).length === 0) 
    throw new Error("User config is empty! Tip: run setup to fill it.");
if (!default_config || Object.keys(default_config).length === 0)
    throw new Error("Default config is empty! Please, get original default config from this repository.");
if (!user_config.username) throw new Error("Username not found!");
if (!user_config.repo) throw new Error("Repository URL not found!");
if (!user_config.branch) throw new Error("Branch not found!");

const config_git: ConfigGit = {
    username: user_config.username,
    repo: user_config.repo,
    branch: user_config.branch ? user_config.branch : default_config.branch,
};

const config_server: ConfigServer = {
    timer_interval: user_config.timer_interval ? 
        user_config.timer_interval : default_config.timer_interval,
    minutes_difference: user_config.minutes_difference ? 
        user_config.minutes_difference : default_config.minutes_difference,
    port: user_config.port ? user_config.port : default_config.port,
}

console.log(`Running with config: ${JSON.stringify(config, null, "\t")}\n`);

let counter = 0;
let prev_commit: string;
let current_commit: string;

async function getBranch() {
    return await axios.get(
        getGitBranchURL(config),
        axios_config_git
    );
}

function start() {
    return new Promise((resolve: any, reject: any) => {
        getBranch()
            .then(res => {
                current_commit = res.data.commit.sha;
                const res_commit_date = new Date(res.data.commit.commit.author.date);
                const current_date = new Date();

                const commit_date = {
                    year: res_commit_date.getFullYear(),
                    month: res_commit_date.getMonth(),
                    day: res_commit_date.getDay(),
                    hour: res_commit_date.getHours(),
                    minutes: res_commit_date.getMinutes()
                }
                const user_date = {
                    year: current_date.getFullYear(),
                    month: current_date.getMonth(),
                    day: current_date.getDay(),
                    hour: current_date.getHours(),
                    minutes: current_date.getMinutes() 
                }

                if (commit_date.year !== user_date.year) return Promise.resolve(false);
                if (commit_date.month !== user_date.month) return Promise.resolve(false);
                if (commit_date.day !== user_date.day) return Promise.resolve(false);
                if (commit_date.hour !== user_date.hour) return Promise.resolve(false);

                if ((user_date.minutes - commit_date.minutes) >= config.minutes_difference) 
                    return Promise.resolve(false);

                if (current_commit !== prev_commit) {
                    prev_commit = current_commit;
                    counter = 0;
                }

                if (
                    prev_commit === current_commit &&
                    counter >= 2
                ) return Promise.resolve(false);

                return Promise.resolve(true);
            })
            .then(isSound => {
                console.log("isSound:", isSound);
                if (isSound) {
                    player.play({
                        path: `./assets/sounds/meow${getRandomInt(1, 3)}.wav`
                    });
                    counter++;
                }

                resolve();
            })
            .catch(err => reject(new Error(err)));
    });
}

const app = express();

app.listen(config.port, () => {
    console.log(`Listening at ${config.port}`);
    start();
    setInterval(start, config.timer_interval);
})
