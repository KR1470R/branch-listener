import default_config from "../configs/default_config.js";
import user_config from "../configs/user_config.js";
import { Config } from "types";

if (!user_config.repo_url) throw new Error("Repository URL not found!");

const config: Config = {
    repo_url: user_config.repo_url,
    branch: user_config.branch ? user_config.branch : default_config.default_branch,
    timer: user_config.timer ? parseInt(user_config.timer) : default_config.timer,
    port: user_config.port ? parseInt(user_config.port) : default_config.port
}

console.log("Hello World!", config, defineBranchCommitsURL());

function defineBranchCommitsURL() {
    if (config.repo_url.endsWith("/")) return `${config.repo_url}commits/${config.branch}`;
    else return `${config.repo_url}/commits/${config.branch}`;
}
