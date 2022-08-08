
export type ConfigServer = {
    port: number;
    timer_interval: number;
    minutes_difference: number;
    cvs: string;
}

export type ConfigGit = {
    username: string,
    repo: string;
    branch: string;
};

export type ConfigBitbucket = {
    workspace: string;
    repo_slug: string;
    branch: string;
    access_token: string;
}

export type Configs = ConfigServer | ConfigGit | ConfigBitbucket;
