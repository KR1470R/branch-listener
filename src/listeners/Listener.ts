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
  ConfigGitlab,
  ErrorType,
  AxiosConfigs,
  AxiosGithub,
  AxiosBitbucket,
  AxiosGitlab,
} from "../util/types";
import { parseDate, getRandomInt, getDateType } from "../util/extra";
import { SoundManager } from "../util/SoundManager";
import NotificationManager from "../util/NotificationManager";
import Logger from "../util/Logger";
import { Events } from "../util/extra";

export default abstract class Listener {
  public config: ConfigsCVS;
  public readonly id: number;
  public readonly config_server: ConfigServer;
  public readonly axios_config: AxiosConfigs;
  private cvs_name: supportableCVS;
  private counter = 0;
  private prev_commit!: string;
  private current_commit!: string;
  private hours_difference = 0;
  private interval!: NodeJS.Timer;
  private soundManager: SoundManager;
  private notificationManager: NotificationManager;
  private logger: Logger;
  private event_trigger_count = 0;

  constructor(
    cvs_name: supportableCVS,
    id: number,
    config: ConfigsCVS,
    config_server: ConfigServer,
    axios_config: AxiosConfigs,
    soundManager: SoundManager,
    logger: Logger
  ) {
    this.cvs_name = cvs_name;
    this.config = config;
    this.id = config.id;
    this.config_server = config_server;
    this.axios_config = axios_config;
    (this.soundManager = soundManager),
      (this.notificationManager = new NotificationManager());
    this.logger = logger;
  }

  public get branch_name() {
    return this.config.branch;
  }

  private getGitBranchURL() {
    let config;

    switch (this.cvs_name) {
      case "github":
        config = this.config as ConfigGithub;
        return `https://api.github.com/repos/${config.username}/${config.repository}/branches/${config.branch}`;
      case "bitbucket":
        config = this.config as ConfigBitbucket;
        return `https://api.bitbucket.org/2.0/repositories/${config.workspace}/${config.repository_slug}/refs/branches/${config.branch}`;
      case "gitlab":
        config = this.config as ConfigGitlab;
        return `https://gitlab.com/api/v4/projects/${config.project_id}/repository/branches/${config.branch}`;
      default:
        this.logger.throw(`Uknown cvs name: ${this.cvs_name}`);
    }
  }

  private getBranchData(): Promise<CVSResponses> {
    return new Promise((resolve, reject) => {
      axios
        .get(this.getGitBranchURL(), this.axios_config)
        .then((data) => resolve(data.data as unknown as CVSResponses))
        .catch((err) => reject(err));
    });
  }

  private async getCommitData() {
    const branch = await this.getBranchData();
    const data = {
      sha: "",
      date: "",
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
      default:
        this.logger.throw(`Uknown cvs name: ${this.cvs_name}`);
    }
    return data;
  }

  private async isSoundNewCommit(): Promise<boolean> {
    try {
      const commitData = await this.getCommitData();

      this.current_commit = commitData.sha;
      const res_commit_date = new Date(commitData.date);
      const current_date = new Date();

      const commit_date = getDateType(res_commit_date);
      const user_date = getDateType(current_date);

      this.logger.log(`{commit date: ${parseDate(commit_date)}}`);
      this.logger.log(`{user date: ${parseDate(user_date)}}`);

      if (commit_date.year !== user_date.year) return Promise.resolve(false);
      if (commit_date.month !== user_date.month) return Promise.resolve(false);
      if (commit_date.day !== user_date.day) return Promise.resolve(false);
      if (user_date.hour > commit_date.hour)
        this.hours_difference = (user_date.hour - commit_date.hour) * 60;

      this.logger.log(
        "minutes difference:",
        String(user_date.minutes - commit_date.minutes + this.hours_difference)
      );

      if (
        user_date.minutes - commit_date.minutes + this.hours_difference >=
        this.config_server.minutes_difference
      )
        return Promise.resolve(false);

      this.logger.log("previus commit:", this.prev_commit);
      this.logger.log("current commit:", this.current_commit);

      if (this.current_commit !== this.prev_commit) {
        this.prev_commit = this.current_commit;
        this.counter = 0;
      }

      this.logger.log("counter:", String(this.counter));

      if (this.prev_commit === this.current_commit && this.counter >= 2)
        return Promise.resolve(false);

      this.counter++;

      return Promise.resolve(true);
    } catch (error: unknown) {
      this.logger.log(
        `${this.cvs_name.toUpperCase()}LISTENER ERROR:`,
        (error as ErrorType).message
      );
      return Promise.resolve(false);
    }
  }

  private async listen() {
    try {
      const isSound = await this.isSoundNewCommit();
      this.logger.log("isSound:", String(isSound));

      if (isSound) {
        this.soundManager.play(`meow${getRandomInt(1, 3)}.mp3`);
        this.notificationManager.notify(
          `New commit in ${this.branch_name}!`,
          `Hurry up to pull the ${this.branch_name}!`
        );
      }

      this.logger.logNewLine();

      return Promise.resolve();
    } catch (err) {
      this.logger.throw(String(err));
    }
  }

  public async spawn() {
    this.interval = setInterval(
      () => this.listen(),
      this.config_server.timer_interval
    );

    this.logger.log(`${"=".repeat(10)}|Started|${"=".repeat(10)}`);

    await this.listen();

    Events.on(`${this.cvs_name}_updated`, (new_configs: ConfigsCVS[]) => {
      this.event_trigger_count++;
      if (this.event_trigger_count > 1) {
        new_configs = new_configs.filter(
          (config: ConfigsCVS) => config.id === this.id
        );

        if (new_configs[0]) {
          this.config = new_configs[0] as ConfigsCVS;
          this.update_axios();
          if (this.config.status && this.config.status === "active")
            this.restart();
        }
        this.event_trigger_count = 0;
      }
    });

    return Promise.resolve();
  }

  public stop(reason?: string) {
    if (this.interval) clearInterval(this.interval);
    this.logger.log(`Has been stopped. ${reason ? `\n${reason}` : ""}`);
  }

  public async restart() {
    if (this.interval) {
      clearInterval(this.interval);
      await this.spawn();

      return Promise.resolve();
    }
  }

  private update_axios() {
    switch (this.cvs_name) {
      case "github":
        (this.axios_config as AxiosGithub).headers["Authorization"] = (
          this.config as ConfigGitlab
        ).token;
        break;
      case "bitbucket":
        (this.axios_config as AxiosBitbucket).auth.username = (
          this.config as ConfigBitbucket
        ).username;
        (this.axios_config as AxiosBitbucket).auth.password = (
          this.config as ConfigBitbucket
        ).app_password;
        break;
      case "gitlab":
        (this.axios_config as AxiosGitlab).headers["PRIVATE-TOKEN"] = (
          this.config as ConfigGitlab
        ).token;
    }
  }
}
