import axios, { AxiosRequestConfig } from "axios";
import { ConfigBitbucket, ConfigServer } from "./util/types";

export default class BitbucketListener {
    
    private config: ConfigBitbucket;
    private config_server: ConfigServer; 
    private axios_config: object;
    private counter: number = 0;
    private prev_commit!: string;
    private current_commit!: string;
    private hours_difference: number = 0;

    constructor(config: ConfigBitbucket, config_server: ConfigServer) {
        this.config = config;
        this.config_server = config_server;
        this.axios_config = {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
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

            this.current_commit = branch.data.target.hash;
            const res_commit_date = new Date(branch.data.target.date);
            const current_date = new Date();

            const commit_date = {
                year: res_commit_date.getFullYear(),
                month: res_commit_date.getMonth(),
                day: res_commit_date.getDay(),
                hour: res_commit_date.getHours(),
                minutes: res_commit_date.getMinutes()
            }
            const user_date = {
                year: current_date.getFullYear(),
                month: current_date.getMonth(),
                day: current_date.getDay(),
                hour: current_date.getHours(),
                minutes: current_date.getMinutes() 
            }

            console.log("commit date:", commit_date);
            console.log("user date:", user_date);

            if (commit_date.year !== user_date.year) return Promise.resolve(false);
            if (commit_date.month !== user_date.month) return Promise.resolve(false);
            if (commit_date.day !== user_date.day) return Promise.resolve(false);
            if (user_date.hour > commit_date.hour) 
                this.hours_difference = (user_date.hour - commit_date.hour) * 60;

            if (
                ((user_date.minutes - commit_date.minutes) + this.hours_difference) >= 
                this.config_server.minutes_difference
            ) 
                return Promise.resolve(false);

            if (this.current_commit !== this.prev_commit) {
                this.prev_commit = this.current_commit;
                this.counter = 0;
            }

            if (
                this.prev_commit === this.current_commit &&
                this.counter >= 2
            ) return Promise.resolve(false);

            return Promise.resolve(true);
        } catch (error: any) {
            console.log("BITBUCKET ERROR:", error);
            return Promise.resolve(false);
        }
    }
}