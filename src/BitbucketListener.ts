import axios from "axios";
import { ConfigBitbucket, ConfigServer } from "./util/types";

export default class BitbucketListener {
    
    private config: ConfigBitbucket;
    private config_server: ConfigServer; 
    private axios_config: object;

    constructor(config: ConfigBitbucket, config_server: ConfigServer) {
        this.config = config;
        this.config_server = config_server;
        this.axios_config = {
            headers: {
                "Accept": "application/json"
            },
            auth: {
                username: this.config.username,
                password: this.config.app_password
            }
        };
    }

    private getGitBranchURL() {
        return `https://api.bitbucket.org/2.0/repositories/${this.config.workspace}/${this.config.repo_slug}/refs/branches/${this.config.branch}`;
    }

    private async getBranchData() {
        return await axios.get(
            this.getGitBranchURL(),
            this.axios_config
        );
    }

    public async isSoundNewCommit() {
        try {
            const branch = await this.getBranchData();
            console.log("branch:", branch);
            return Promise.resolve(false);
        } catch (error) {
            console.log("BITBUCKET ERROR:", error);
            return Promise.resolve(false);
        }
    }
}