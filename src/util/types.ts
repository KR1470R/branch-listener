
export type ConfigServer = {
    cvs: string;
    port: number;
    timer_interval: number;
    minutes_difference: number;
    volume: number;
}

export type ConfigGithub = {
    username: string,
    repo: string;
    token: string;
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

export type ConfigsCVS = ConfigGithub | ConfigBitbucket | ConfigGitlab;

export type supportableCVS = "github" | "bitbucket" | "gitlab";

export type supportable_configs = "server" | "github" | "bitbucket" | "gitlab";

export type GithubResponse = {
    name: string;
    commit: {
        sha: string;
        node_id: string;
        commit: {
            author: {
                name: string;
                email: string;
                date: string;
            };
            committer: {
                name: string;
                email: string;
                date: string;
            };
            message: string;
            tree: {
                sha: string;
                url: string;
            };
            url: string;
            comment_count: string;
            verification: {
                verified: boolean;
                reason: string;
                signature: any;
                payload: any;
            };
        };
        protected: boolean;
    };
};

export type BitbucketResponse = {
    name: string;
    target: {
        type: string;
        hash: string;
        date: string;
        author: {
            type: string;
            raw: string;
            user: {
                display_name: string;
                links: object;
                type: string;
                uuid: string;
                account_id: string;
                nickname: string;
            };
        };
        message: string;
        links: object;
        parents: object[];
        repository: {
            type: string;
            full_name: string;
            links: object;
            name: string;
            uuid: string;
        };
    };
    links: object;
    type: string;
    merge_strategies: string[];
    default_merge_strategy: string;
};

export type GitlabResponse = {
    name: string;
    commit: {
        id: string;
        short_id: string;
        created_at: string;
        parent_ids: string[];
        title: string;
        message: string;
        author_name: string;
        author_email: string;
        authored_date: string;
        committer_name: string;
        committer_email: string;
        committed_date: string;
        trailers: object;
        web_url: string
    }
    merged: boolean;
    protected: boolean;
    developers_can_push: boolean;
    developers_can_merge: boolean;
    can_push: boolean;
    deault: boolean;
    web_url: string;
};

export type CVSResponses = GithubResponse | BitbucketResponse | GitlabResponse;

export type DateType = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minutes: number; 
}
