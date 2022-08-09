import axios from "axios";
import { ConfigGit, ConfigServer } from "./util/types";

export default class GitListener {

    private config: ConfigGit;
    private config_server: ConfigServer; 
    private readonly axios_config: object = {
        headers: {
            "Content-Type": "application/vnd.github+json",
            "Access-Control-Allow-Origin": "*",
        }
    };
    private counter: number = 0;
    private prev_commit!: string;
    private current_commit!: string;

    constructor(config: ConfigGit, config_server: ConfigServer) {
        this.config = config;
        this.config_server = config_server;
    }

    private getGitBranchURL() {
        return `https://api.github.com/repos/${this.config.username}/${this.config.repo}/branches/${this.config.branch}`;
    }

    private async getBranchData() {
        return await axios.get(
            this.getGitBranchURL(),
            this.axios_config
        );
    }

    public async isSoundNewCommit(): Promise<boolean> {
        try {
            const branch = await this.getBranchData();

            this.current_commit = branch.data.commit.sha;
            const res_commit_date = new Date(branch.data.commit.commit.author.date);
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

            if (commit_date.year !== user_date.year) return Promise.resolve(false);
            if (commit_date.month !== user_date.month) return Promise.resolve(false);
            if (commit_date.day !== user_date.day) return Promise.resolve(false);
            if (commit_date.hour !== user_date.hour) return Promise.resolve(false);

            if ((user_date.minutes - commit_date.minutes) >= this.config_server.minutes_difference) 
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
        } catch (error) {
            console.log("GITLISTENER ERROR:", error);
            return Promise.resolve(false);
        }
    }
}