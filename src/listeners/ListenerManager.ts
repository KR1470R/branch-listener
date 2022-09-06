import ConfigFactory from "../util/ConfigFactory";
import Listener from "./Listener";
import { ListenersMapType, ListenerStatus, ListenerMeta } from "../util/types";
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
import ListenersJournalManager from "../util/ListenersJournalManager";

export default class ListenerManager {

    private readonly server_config: ConfigFactory;
    private readonly github_config: ConfigFactory;
    private readonly bitbucket_config: ConfigFactory;
    private readonly gitlab_config: ConfigFactory;
    private readonly ListenersMap: ListenersMapType = {
        "github": new Map(),
        "bitbucket": new Map(),
        "gitlab": new Map()
    }
    private soundManager!: SoundManager;
    private nonEmptyCVSConfigs: ConfigFactory[] = [];
    private listenersJournalManager: ListenersJournalManager;

    constructor() {
        this.server_config = new ConfigFactory("server");
        this.github_config = new ConfigFactory("github");
        this.bitbucket_config = new ConfigFactory("bitbucket");
        this.gitlab_config = new ConfigFactory("gitlab");
        this.listenersJournalManager = new ListenersJournalManager();
    }

    public async init() {
        await this.server_config.init();
        await this.github_config.init();
        await this.bitbucket_config.init();
        await this.gitlab_config.init();
        this.soundManager = new SoundManager(
            Number(this.server_config.getProperty(0, "volume"))
        );
        this.checkIsAllCVSConfigsEmpty();
        this.checkConfigsValidation();
        await this.listenersJournalManager.init();
    }

    private checkIsAllCVSConfigsEmpty() {
        if (!this.github_config.isEmpty()) 
            this.nonEmptyCVSConfigs.push(this.github_config);
        if (!this.bitbucket_config.isEmpty()) 
            this.nonEmptyCVSConfigs.push(this.bitbucket_config);
        if (!this.gitlab_config.isEmpty()) 
            this.nonEmptyCVSConfigs.push(this.gitlab_config);
        
        if (this.nonEmptyCVSConfigs.length === 0)
            throw new Error("All CVS Configs is empty! Please setup branch-listener!");
    }

    private checkConfigsValidation() {
        this.server_config.checkValidation();
        this.github_config.checkValidation();
        this.bitbucket_config.checkValidation();
        this.gitlab_config.checkValidation();
    }

    private restoreListenersFromJournal() {
        for (const [cvs_name, map] of Object.entries(this.ListenersMap)) {
            if (!this.listenersJournalManager.isEmpty(cvs_name as supportableCVS)) {
                for (
                    const listeners_journal of 
                    this.listenersJournalManager.getListenersJournal(cvs_name as supportableCVS)
                ) {
                    this.spawnListener(
                        cvs_name as supportableCVS, 
                        (listeners_journal as ListenerMeta).id
                    );
                }
            } 
        }
    }

    private getConfig(
        cvs_name: supportableCVS,
        id: number
    ): ConfigsCVS {
        switch (cvs_name) {
            case "github": 
                return this.github_config
                            .getAllProperties(id) as ConfigGithub;
            case "bitbucket": 
                return this.bitbucket_config
                            .getAllProperties(id) as ConfigBitbucket;
            case "gitlab": 
                return this.gitlab_config
                            .getAllProperties(id) as ConfigGitlab;
            default: throw new Error("Uknown CVS name!");                
        }
    }

    private spawnListener(
        cvs_name: supportableCVS,
        id: number,
        status: ListenerStatus = "pending" 
    ) {
        if (this.isListenerAlive(cvs_name, id)) return;

        const server_config_all = this.server_config
            .getAllProperties() as ConfigServer;

        let listener: Listener;

        switch (cvs_name) {
            case "github": 
                listener = new GithubListener(
                    this.getConfig(cvs_name, id) as ConfigGithub,
                    server_config_all,
                    this.soundManager
                );
                break;
            case "bitbucket":
                listener = new BitbucketListener(
                    this.getConfig(cvs_name, id) as ConfigBitbucket,
                    server_config_all,
                    this.soundManager
                );
                break;
            case "gitlab":
                listener = new GitlabListener(
                    this.getConfig(cvs_name, id) as ConfigGitlab,
                    server_config_all,
                    this.soundManager
                );
                break;
            default: throw new Error("Uknown CVS name!");    
        }

        this.ListenersMap[cvs_name].set(
            id,
            listener
        );
        console.log("trying to add", id, cvs_name);
        this.listenersJournalManager.addListener(
            cvs_name,
            {
                id,
                status
            }
        );

        return listener;
    }

    private killListener(
        cvs_name: supportableCVS,
        id: number
    ) {
        if (this.isListenerAlive(cvs_name, id)) {
            this.ListenersMap[cvs_name].get(id)!.stop();
            this.ListenersMap[cvs_name].delete(id);
        } else console.log(`The listener ${cvs_name}:${id} has already murdered.`);
    }

    private isListenerAlive(
        cvs_name: supportableCVS,
        id: number
    ) {
        if (this.ListenersMap[cvs_name].get(id)) return true;
        else return false;
    }

    public getLastListener(
        cvs_name: supportableCVS,
        type: "key" | "value" | "all"
    ) {
        switch (type) {
            case "key":
                return Array.from(this.ListenersMap[cvs_name].keys()).pop();
            case "value":
                return Array.from(this.ListenersMap[cvs_name].values()).pop();
            case "all":
                const all = [];
                all.push(Array.from(this.ListenersMap[cvs_name].keys()).pop());
                all.push(Array.from(this.ListenersMap[cvs_name].values()).pop());
                return all;
        }
    }

    public getListListeners(cvs_name: supportableCVS) {}

    public async startListen() {
        const listener_promises = [];

        for (const configCVS of this.nonEmptyCVSConfigs) {
            for (const config of configCVS.configsArray) {
                const listener = this.spawnListener(
                    configCVS.name as supportableCVS,
                    configCVS.configsArray.indexOf(config)
                );

                if (listener) {
                    listener_promises.push(
                        listener.spawn()
                    );
                }
            }
        }

        return Promise.allSettled(listener_promises);
    }
}
