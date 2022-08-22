
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

export type ConfigGitlab = {
    project_id: string;
    token: string;
    branch: string;
}

export type Configs = ConfigServer | ConfigGit | ConfigBitbucket | ConfigGitlab;

export type supportableCVS = "git" | "bitbucket" | "gitlab";

export type supportable_configs = "server" | "git" | "bitbucket" | "gitlab";

export interface Listener {
    config: ConfigGit | ConfigBitbucket | ConfigGitlab;
    config_server: ConfigServer;
    readonly axios_config: object;
    branch_name: string;
    isSoundNewCommit(): Promise<boolean>;
}
