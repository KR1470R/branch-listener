
export type ConfigServer = {
    cvs: string;
    port: number;
    timer_interval: number;
    minutes_difference: number;
    volume: number;
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

export interface Listener {
    config: ConfigGit | ConfigBitbucket;
    config_server: ConfigServer;
    readonly axios_config: object;
    branch_name: string;
    isSoundNewCommit(): Promise<boolean>;
}
