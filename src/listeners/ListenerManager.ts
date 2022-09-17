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
import Logger from "../util/Logger";
import process from "process";
import { signalManager } from "../util/extra";

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

    constructor() {
        this.server_config = new ConfigFactory("server");
        this.github_config = new ConfigFactory("github");
        this.bitbucket_config = new ConfigFactory("bitbucket");
        this.gitlab_config = new ConfigFactory("gitlab");

        signalManager.addCallback(this.stopAllListeners.bind(this));
    }

    public async init() {
        await this.server_config.init();
        await this.github_config.init();
        await this.bitbucket_config.init();
        await this.gitlab_config.init();
        const volume = await this.server_config.getProperty(0, "volume");
        this.soundManager = new SoundManager(
            Number(volume)
        );
        this.checkIsAllCVSConfigsEmpty();
        await this.checkConfigsValidation();
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
        console.log("[checkConfigsValidation]")
        this.server_config.checkValidation();
        this.github_config.checkValidation();
        this.bitbucket_config.checkValidation();
        this.gitlab_config.checkValidation();
    }

    private async restoreListenersFromConfigs(): Promise<void> {
        console.log("[restoreListenersFromConfigs]")
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
        return this.getCVSConfigManager(cvs_name).getAllProperties(id) as Promise<ConfigsCVS>;
    }

    private async spawnListener(
        cvs_name: supportableCVS,
        id: number,
    ) {
        if (this.isListenerAlive(cvs_name, id)) return;

        const server_config_all = await this.server_config
            .getAllProperties() as ConfigServer;

        let listener: Listener;
        console.log(cvs_name, id)
        const logger = new Logger(cvs_name, id);
        await logger.init();

        const config = await this.getConfig(cvs_name, id);
        switch (cvs_name) {
            case "github":
                
                listener = new GithubListener(
                    id,
                    config as ConfigGithub,
                    server_config_all,
                    this.soundManager, 
                    logger
                );
                break;
            case "bitbucket":
                listener = new BitbucketListener(
                    id,
                    config as ConfigBitbucket,
                    server_config_all,
                    this.soundManager,
                    logger
                );
                break;
            case "gitlab":
                listener = new GitlabListener(
                    id,
                    config as ConfigGitlab,
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
        
        return listener;
    }

    public async killListener(
        cvs_name: supportableCVS,
        id: number
    ) {
        // if (this.isListenerAlive(cvs_name, id)) {
            await this.stopListener(cvs_name, id);
            this.ListenersMap[cvs_name].delete(id);
            await this.getCVSConfigManager(cvs_name).removeConfig(id);
            console.log(`Listener ${cvs_name}:${id} has been killed.`);
        // } else console.log(`The listener ${cvs_name}:${id} has already murdered.`);
    }

    private async activateListener(cvs_name: supportableCVS, id: number) {
        await this.getCVSConfigManager(cvs_name).setStatusListener(id, "active");
        await this.ListenersMap[cvs_name].get(id)!.spawn();
        console.log("spawned")
        return Promise.resolve();
    }

    private async activateAllListeners() {
        for (const cvs_name of Object.keys(this.ListenersMap)) {
            for (const id of this.ListenersMap[cvs_name as supportableCVS].keys()) {
                await this.activateListener(cvs_name as supportableCVS, id);
            }
        }

        return Promise.resolve();
    }

    public async stopListener(
        cvs_name: supportableCVS, 
        id: number, 
        reason?: string,
    ) {
        this.ListenersMap[cvs_name].get(id)!.stop(reason);
        await this.getCVSConfigManager(cvs_name).setStatusListener(id, "inactive");

        return Promise.resolve();
    }

    private async stopAllListeners(reason?: string) {
        for (const cvs_name of Object.keys(this.ListenersMap)) {
            for (const id of this.ListenersMap[cvs_name as supportableCVS].keys()) {
                await this.stopListener(
                    cvs_name as supportableCVS, 
                    id, 
                    reason
                );
            }
        }

        return Promise.resolve();
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

    public async startListen() {
        await this.activateAllListeners();
    }

    public getAllListListeners() {
        const all_contents: string[] = [];
        for (const cvs_name of Object.keys(this.ListenersMap)) {
            const contents = [`${cvs_name.toUpperCase()}:`];
            for (
                const listener_meta of 
                this.getCVSConfigManager(cvs_name as supportableCVS).getAllConfigs() as ConfigsCVS[]
            ) {
                const tab = " ".repeat(6);
                if (
                    listener_meta && 
                    Object.keys(listener_meta).length > 0
                ) {
                    contents.push(
                        `${tab}| ${listener_meta.id}${tab}${listener_meta.status} |`
                    );
                } else contents.push(`${tab}empty`);
            }
            
            all_contents.push(contents.join("\n"));
        }

        return all_contents.join("\n");
    }
}
