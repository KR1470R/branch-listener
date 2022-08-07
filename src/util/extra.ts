import { Config } from "./types";

export const getGitBranchURL = (config: Config) => {
    return `https://api.github.com/repos/${config.username}/${config.repo}/branches/${config.branch}`;
}
