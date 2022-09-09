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
import Logger from "../util/Logger";

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
        await this.restoreListenersFromJournal();
        await this.restoreListenersFromConfigs();
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

    private async restoreListenersFromJournal(): Promise<void> {
        for (const cvs_name of Object.keys(this.ListenersMap)) {
            if (!this.listenersJournalManager.isEmpty(cvs_name as supportableCVS)) {
                for (
                    const listeners_journal of 
                    this.listenersJournalManager.getListenersJournal(cvs_name as supportableCVS)
                ) {
                    await this.spawnListener(
                        cvs_name as supportableCVS, 
                        (listeners_journal as ListenerMeta).id
                    );
                }
            } 
        }

        return Promise.resolve();
    }

    private async restoreListenersFromConfigs(): Promise<void> {
        for (const configCVS of this.nonEmptyCVSConfigs) {
            for (
                const config of (configCVS.configsArray as unknown as ConfigsCVS[])
            ) {
                if (
                    !this.ListenersMap[configCVS.name as supportableCVS]
                        .get(configCVS.configsArray.indexOf(config))
                )
                    await this.spawnListener(
                        configCVS.name as supportableCVS,
                        configCVS.configsArray.indexOf(config)
                    );
            }
        }

        return Promise.resolve();
    }

    private getCVSConfigManager(cvs_name: supportableCVS): ConfigFactory {
        switch(cvs_name) {
            case "github": return this.github_config;
            case "bitbucket": return this.bitbucket_config;
            case "gitlab": return this.gitlab_config;
            default: throw new Error("Uknown CVS name!"); 
        }
    }

    private getConfig(
        cvs_name: supportableCVS,
        id: number
    ) {
        return this.getCVSConfigManager(cvs_name).getAllProperties(id) as ConfigsCVS;
    }

    private async spawnListener(
        cvs_name: supportableCVS,
        id: number,
        status: ListenerStatus = "pending" 
    ) {
        if (this.isListenerAlive(cvs_name, id)) return;

        const server_config_all = this.server_config
            .getAllProperties() as ConfigServer;

        let listener: Listener;

        const logger = new Logger(cvs_name, id);
        await logger.init();

        switch (cvs_name) {
            case "github": 
                listener = new GithubListener(
                    this.getConfig(cvs_name, id) as ConfigGithub,
                    server_config_all,
                    this.soundManager, 
                    logger
                );
                break;
            case "bitbucket":
                listener = new BitbucketListener(
                    this.getConfig(cvs_name, id) as ConfigBitbucket,
                    server_config_all,
                    this.soundManager,
                    logger
                );
                break;
            case "gitlab":
                listener = new GitlabListener(
                    this.getConfig(cvs_name, id) as ConfigGitlab,
                    server_config_all,
                    this.soundManager,
                    logger
                );
                break;
            default: throw new Error("Uknown CVS name!");    
        }

        this.ListenersMap[cvs_name].set(
            id,
            listener
        );

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
            this.stopListener(cvs_name, id);
            this.ListenersMap[cvs_name].delete(id);
            this.listenersJournalManager.removeListener(cvs_name, id);
            this.getCVSConfigManager(cvs_name).removeConfig(id);
        } else console.log(`The listener ${cvs_name}:${id} has already murdered.`);
    }

    private activateListener(cvs_name: supportableCVS, id: number) {
        this.ListenersMap[cvs_name].get(id)!.spawn();
        this.listenersJournalManager.setListenerStatus(cvs_name, id, "active");
    }

    private activateAllListeners() {
        for (const cvs_name of Object.keys(this.ListenersMap)) {
            this.ListenersMap[cvs_name as supportableCVS]
                .forEach((value: Listener, id: number) => {
                    this.activateListener(cvs_name as supportableCVS, id);
                });
        }
    }

    private stopListener(cvs_name: supportableCVS, id: number) {
        this.ListenersMap[cvs_name].get(id)!.stop();
        this.listenersJournalManager.setListenerStatus(cvs_name, id, "inactive");
    }

    private stopAllListeners() {
        for (const cvs_name of Object.keys(this.ListenersMap)) {
            this.ListenersMap[cvs_name as supportableCVS]
                .forEach((value: Listener, id: number) => {
                    this.stopListener(cvs_name as supportableCVS, id);
                });
        }
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
                const all = []; // [key, value]
                all.push(Array.from(this.ListenersMap[cvs_name].keys()).pop());
                all.push(Array.from(this.ListenersMap[cvs_name].values()).pop());
                return all;
        }
    }

    public getListListeners(cvs_name: supportableCVS) {}

    public async startListen() {
        // this.killListener("gitlab", 2);
        // this.listenersJournalManager.setListenerStatus("github", 0, "active");
        this.activateAllListeners();
    }
}
