import { 
    ConfigServer, 
    ConfigGithub, 
    ConfigBitbucket,
    ConfigGitlab,
    supportable_configs
} from "../util/types";
import JSONManager from "./JSONManager";
import { getBaseDir, isArrayHasAnyEmptyObject } from "./extra";

export default class ConfigFactory {
    
    private readonly base_path: string = `${getBaseDir()}configs/`;
    private config_name: string = "config.json";
    public type: supportable_configs;
    public manager!: JSONManager;

    constructor(config_type: supportable_configs) {
        this.type = config_type;
    }

    public async init() {
        this.manager = new JSONManager(`${this.base_path}${this.type}/${this.config_name}`);
        await this.manager.init();
    }

    public get configsArray() {
        return this.manager.content;
    }

    public get name() {
        return this.type;
    }

    public defineConfig(
        id: number = 0
    ) {
        let goalConfig;
        switch (this.type) {
            case "server":
                goalConfig = (this.manager.content as ConfigServer[])[0];
                break;
            case "github":
                goalConfig = (this.manager.content as ConfigGithub[])[id]
                break;
            case "bitbucket":
                goalConfig = (this.manager.content as ConfigBitbucket[])[id];
                break;
            case "gitlab":
                goalConfig = (this.manager.content as ConfigGitlab[])[id];
                break;
            default: throw new Error("Uknown type config!");
        }

        if (!goalConfig) throw new Error(`${this.type} config not found at id ${id}!`);
        return goalConfig;
    }

    public getProperty(
        id: number = 0,
        key: string
    ): number | string {
        const config = this.defineConfig(id);

        return config[key as keyof typeof config];
    }

    public getAllProperties(id: number = 0) {
        return this.defineConfig(id);
    }

    public setProperty(
        id: number = 0,
        key: string, 
        value: string | number
    ) {
        const config = this.defineConfig(id);
        config[key as keyof typeof config] = value as keyof typeof config;
    }

    public async saveAll(override: boolean) {
        await this.manager.save(override);
    }

    private getKeys(id: number = 0): Array<string> {
        return Object.keys(this.manager.content[id]);
    }

    public checkValidation() {
        const base_template = `ERROR in ${this.type} config:`;

        if (this.type === "server") {
            if (this.isEmptySpecified(0)) 
                throw new Error(`${base_template} config is empty!`);
            
            const cvs_parameters = this.getKeys(0);

            for (const key of cvs_parameters) {
                if (!this.getProperty(0, key))
                    throw new Error(`${base_template} Parameter ${cvs_parameters[Number(key)]} not found!`);
            }
        } else {
            for (let config_id = 0; config_id <= this.manager.content.length - 1; config_id++) {
                const cvs_parameters = this.getKeys(config_id);

                for (const key of cvs_parameters) {
                    if (!this.getProperty(config_id, key))
                        throw new Error(`${base_template} Parameter ${cvs_parameters[Number(key)]} not found!`);
                }
            }
        }
    }

    public isEmptySpecified(id: number) {
        return (
            !this.manager?.content[id] || 
            Object.keys(this.manager?.content[id])?.length === 0
        );
    }

    public isEmpty() {
        return (
            !this.manager.content ||
            this.manager.content.length === 0 ||
            isArrayHasAnyEmptyObject(this.manager.content)
        );
    }

    public async removeConfig(id: number) {
        await this.manager.removeSpecifiedObject(id);
    }
}
