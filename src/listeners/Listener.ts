import axios from "axios";
import { 
    ConfigsCVS,
    ConfigServer,
    CVSResponses,
    supportableCVS,
    GithubResponse,
    BitbucketResponse,
    GitlabResponse,
    ConfigGithub,
    ConfigBitbucket,
    ConfigGitlab
} from "../util/types";
import { parseDate, getRandomInt } from "../util/extra";
import { SoundManager } from "../util/SoundManager";
import NotificationManager from "../util/NotificationManager";

export default abstract class Listener {

    public readonly config: ConfigsCVS;
    public readonly config_server: ConfigServer; 
    public readonly axios_config: object;
    private cvs_name: supportableCVS;
    private counter: number = 0;
    private prev_commit!: string;
    private current_commit!: string;
    private hours_difference: number = 0;
    private interval!: NodeJS.Timer;
    private soundManager: SoundManager;
    private notificationManager: NotificationManager;

    constructor(
        cvs_name: supportableCVS, 
        config: ConfigsCVS, 
        config_server: ConfigServer, 
        axios_config: object,
        soundManager: SoundManager
    ) {
        this.cvs_name = cvs_name;
        this.config = config;
        this.config_server = config_server;
        this.axios_config = axios_config;
        this.soundManager = soundManager,
        this.notificationManager = new NotificationManager();
    }

    public get branch_name() {
        return this.config.branch;
    }

    private getGitBranchURL() {
        let config;

        switch(this.cvs_name) {
            case "github":
                config = this.config as ConfigGithub;
                return `https://api.github.com/repos/${config.username}/${config.repo}/branches/${config.branch}`;
            case "bitbucket":
                config = this.config as ConfigBitbucket;
                return `https://api.bitbucket.org/2.0/repositories/${config.workspace}/${config.repo_slug}/refs/branches/${config.branch}`;
            case "gitlab":
                config = this.config as ConfigGitlab;
                return `https://gitlab.com/api/v4/projects/${config.project_id}/repository/branches/${config.branch}`;
            default: throw new Error(`Uknown cvs name: ${this.cvs_name}`);
        }
    };

    private async getBranchData(): Promise<CVSResponses> {
        return new Promise((resolve, reject) => {
            axios.get(
                this.getGitBranchURL(),
                this.axios_config
            )
                .then(data => resolve((data.data) as unknown as CVSResponses))
                .catch(err => reject(err))
        });
    }

    private async getCommitData() {
        const branch = await this.getBranchData();
        let data = {
            sha: "",
            date: ""
        };

        switch (this.cvs_name) {
            case "github":
                data.sha = (branch as GithubResponse).commit.sha;
                data.date = (branch as GithubResponse).commit.commit.author.date;
                break;
            case "bitbucket":
                data.sha = (branch as BitbucketResponse).target.hash;
                data.date = (branch as BitbucketResponse).target.date;
                break;
            case "gitlab":
                data.sha = (branch as GitlabResponse).commit.id;
                data.date = (branch as GitlabResponse).commit.created_at;
                break;
                default: throw new Error(`Uknown cvs name: ${this.cvs_name}`);
        }
        return data;
    }

    private async isSoundNewCommit(): Promise<boolean> {
        try {
            const commitData = await this.getCommitData();
            
            this.current_commit = commitData.sha;
            const res_commit_date = new Date(commitData.date);
            const current_date = new Date();

            const commit_date = {
                year: res_commit_date.getFullYear(),
                month: res_commit_date.getMonth(),
                day: res_commit_date.getDate(),
                hour: res_commit_date.getHours(),
                minutes: res_commit_date.getMinutes()
            }
            const user_date = {
                year: current_date.getFullYear(),
                month: current_date.getMonth(),
                day: current_date.getDate(),
                hour: current_date.getHours(),
                minutes: current_date.getMinutes() 
            }

            console.log("commit date:", parseDate(commit_date));
            console.log("user date:", parseDate(user_date));

            if (commit_date.year !== user_date.year) return Promise.resolve(false);
            if (commit_date.month !== user_date.month) return Promise.resolve(false);
            if (commit_date.day !== user_date.day) return Promise.resolve(false);
            if (user_date.hour > commit_date.hour) 
                this.hours_difference = (user_date.hour - commit_date.hour) * 60;

            console.log("minutes difference:", ((user_date.minutes - commit_date.minutes) + this.hours_difference));

            if (
                ((user_date.minutes - commit_date.minutes) + this.hours_difference) >= 
                this.config_server.minutes_difference
            ) 
                return Promise.resolve(false);

            console.log("previus commit:", this.prev_commit);
            console.log("current commit:", this.current_commit);

            if (this.current_commit !== this.prev_commit) {
                this.prev_commit = this.current_commit;
                this.counter = 0;
            }

            console.log("counter:", this.counter);

            if (
                this.prev_commit === this.current_commit &&
                this.counter >= 2
            ) return Promise.resolve(false);
            
            this.counter++;

            return Promise.resolve(true);
        } catch (error: any) {
            console.log(`${this.cvs_name.toUpperCase()}LISTENER ERROR:`, error);
            return Promise.resolve(false);
        }
    }

    private async listen() {
        const isSound = await this.isSoundNewCommit();
        console.log("isSound:", isSound);

        if (isSound) {
            this.soundManager.play(`meow${getRandomInt(1, 3)}.mp3`);
            this.notificationManager.notify(
                `New commit in ${this.branch_name}!`, 
                `Hurry up to pull the ${this.branch_name}!`
            )
        }
        console.log("\n");

        return Promise.resolve();
    }
    
    public async spawn() {
        this.interval = setInterval(this.listen, this.config_server.timer_interval);

        return this.listen();
    }

    public stop() {
        if (this.interval)
            clearInterval(this.interval);
    }
}
