import { ConfigGit } from "./types";

export const getGitBranchURL = (config: ConfigGit) => {
    return `https://api.github.com/repos/${config.username}/${config.repo}/branches/${config.branch}`;
}

export const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
