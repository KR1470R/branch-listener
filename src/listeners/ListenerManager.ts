import ConfigFactory from "../util/ConfigFactory";
import Listener from "./Listener";
import GithubListener from "./GithubListener";
import BitbucketListener from "./BitbucketListener";
import GitlabListener from "./GitlabListener";
import { 
    ConfigsCVS,
    ConfigGithub,
    ConfigBitbucket,
    ConfigGitlab,
    ConfigServer,
    supportableCVS,
} from "../util/types";
import { SoundManager } from "../util/SoundManager";

export default class ListenerManager {

    private readonly server_config: ConfigFactory;
    private readonly github_config: ConfigFactory;
    private readonly bitbucket_config: ConfigFactory;
    private readonly gitlab_config: ConfigFactory;
    private readonly Listeners: {
        "github": Map<number, Listener>,
        "bitbucket": Map<number, Listener>,
        "gitlab": Map<number, Listener>
    } = {
        "github": new Map(),
        "bitbucket": new Map(),
        "gitlab": new Map()
    }
    private soundManager!: SoundManager;

    constructor() {
        this.server_config = new ConfigFactory("server");
        this.github_config = new ConfigFactory("github");
        this.bitbucket_config = new ConfigFactory("bitbucket");
        this.gitlab_config = new ConfigFactory("gitlab");
    }

    public async init() {
        await this.server_config.init();
        await this.github_config.init();
        await this.bitbucket_config.init();
        await this.gitlab_config.init();
        this.soundManager = new SoundManager(
            Number(this.server_config.getProperty(0, "volume"))
        );
        console.log("configs are initilized")
        this.checkIsAllCVSConfigsEmpty();
        this.checkConfigsValidation();
    }

    private checkIsAllCVSConfigsEmpty() {
        if (!this.github_config.isEmpty()) return;
        if (!this.bitbucket_config.isEmpty()) return;
        if (!this.gitlab_config.isEmpty()) return;
        throw new Error("All CVS Configs is empty! Please setup branch-listener!");
    }

    private checkConfigsValidation() {
        this.server_config.checkValidation();
        this.github_config.checkValidation();
        this.bitbucket_config.checkValidation();
        this.gitlab_config.checkValidation();
    }

    private getConfig(cvs_name: supportableCVS): ConfigsCVS {
        switch (cvs_name) {
            case "github": 
                return this.github_config
                            .getAllProperties() as ConfigGithub;
            case "bitbucket": 
                return this.bitbucket_config
                            .getAllProperties() as ConfigBitbucket;
            case "gitlab": 
                return this.gitlab_config
                            .getAllProperties() as ConfigGitlab;
            default: throw new Error("Uknown CVS name!");                
        }
    }

    private swawnListener(
        cvs_name: supportableCVS,
    ) {
        const server_config_all = this.server_config
            .getAllProperties() as ConfigServer;

        let listener: Listener;

        switch (cvs_name) {
            case "github": 
                listener = new GithubListener(
                    this.getConfig(cvs_name) as ConfigGithub,
                    server_config_all,
                    this.soundManager
                );
                break;
            case "bitbucket":
                listener = new BitbucketListener(
                    this.getConfig(cvs_name) as ConfigBitbucket,
                    server_config_all,
                    this.soundManager
                );
                break;
            case "gitlab":
                listener = new GitlabListener(
                    this.getConfig(cvs_name) as ConfigGitlab,
                    server_config_all,
                    this.soundManager
                );
                break;
            default: throw new Error("Uknown CVS name!");    
        }

        this.Listeners[cvs_name].set(
            Number(this.getLastListener(cvs_name, "key")) + 1,
            listener
        );
    }

    private killListener(
        cvs_name: supportableCVS,
        id: number
    ) {
        if (this.isListenerAlive(cvs_name, id)) {
            this.Listeners[cvs_name].get(id)!.stop();
            this.Listeners[cvs_name].delete(id);
        } else console.log(`The listener ${cvs_name}:${id} has already murdered.`);
    }

    private isListenerAlive(
        cvs_name: supportableCVS,
        id: number
    ) {
        if (this.Listeners[cvs_name].get(id)) return true;
        else return false;
    }

    public getLastListener(
        cvs_name: supportableCVS,
        type: "key" | "value" | "all"
    ) {
        switch (type) {
            case "key":
                return Array.from(this.Listeners[cvs_name].keys()).pop();
            case "value":
                return Array.from(this.Listeners[cvs_name].values()).pop();
            case "all":
                const all = [];
                all.push(Array.from(this.Listeners[cvs_name].keys()).pop());
                all.push(Array.from(this.Listeners[cvs_name].values()).pop());
                return all;
        }
        
    }

    public getListListeners(cvs_name: supportableCVS) {
        // const config = this.getConfig(cvs_name);

        
    }
}
