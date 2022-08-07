import { Config } from "./types";

export const defineBranchCommitsURL = (config: Config) => {
    if (config.repo_url.endsWith("/")) return `${config.repo_url}commits/${config.branch}`;
    else return `${config.repo_url}/commits/${config.branch}`;
}