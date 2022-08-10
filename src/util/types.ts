
export type ConfigServer = {
    cvs: string;
    port: number;
    timer_interval: number;
    minutes_difference: number;
}

export type ConfigGit = {
    username: string,
    repo: string;
    branch: string;
};

export type ConfigBitbucket = {
    username: string;
    app_password: string;
    workspace: string;
    repo_slug: string;
    branch: string;
}

export type Configs = ConfigServer | ConfigGit | ConfigBitbucket;

export type supportableCVS = "git" | "bitbucket";

export type supportable_configs = "server" | "git" | "bitbucket";
