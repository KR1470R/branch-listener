import { getGitBranchURL, getRandomInt } from "./util/extra";
import { axios_config_git, minutes_difference } from "./util/globals";
import default_config from "../configs/default_config.js";
import user_config from "../configs/user_config.js";
import { Config } from "./util/types";
import axios from "axios";
import player from "node-wav-player";
import express from "express";

if (!user_config.repo) throw new Error("Repository URL not found!");

const config: Config = {
    username: user_config.username,
    repo: user_config.repo,
    branch: user_config.branch ? user_config.branch : default_config.default_branch,
    timer: user_config.timer ? parseInt(user_config.timer) : default_config.timer,
    port: user_config.port ? parseInt(user_config.port) : default_config.port
}
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

                if ((user_date.minutes - commit_date.minutes) >= minutes_difference) 
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
    
    setInterval(start, 5*60*1000);
})
