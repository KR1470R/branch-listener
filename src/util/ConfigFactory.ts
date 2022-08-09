import { 
    ConfigServer, 
    ConfigGit, 
    ConfigBitbucket,
    Configs,
    supportable_configs
} from "../util/types";
import JSONManager from "./JSONManager";

export default class ConfigFactory {
    
    private readonly base_path: string = "./configs/";
    private config_name!: string;
    public type: "git" | "bitbucket" | "server";
    public manager!: JSONManager;

    constructor(config_type: supportable_configs, isDefault = false) {
        this.type = config_type;
        this.config_name = isDefault && config_type === "server" ? "default_config.json" : "config.json";
        this.manager = new JSONManager(`${this.base_path}${this.type}/${this.config_name}`);
    }

    public getProperty(key: string): number | string {
        switch(this.type) {
            case "git": 
                return (this.manager.content as ConfigGit)[key as keyof ConfigGit];
            case "bitbucket": 
                return (this.manager.content as ConfigBitbucket)[key as keyof ConfigBitbucket];
            case "server": 
                return (this.manager.content as ConfigServer)[key as keyof ConfigServer];
            default: throw new Error("Uknown type config!");
        };   
    }

    public getAllProperties() {
        switch(this.type) {
            case "git":
                return (this.manager.content as ConfigGit);
            case "bitbucket":
                return (this.manager.content as ConfigBitbucket);
            case "server":
                return (this.manager.content as ConfigServer);
            default: throw new Error("Uknown type config!");
        }
    }

    public setProperty(key: string, value: string | number) {
        switch(this.type) {
            case "git": 
                (this.manager.content as ConfigGit)[key as keyof ConfigGit] = value as keyof ConfigGit; 
                break;
            case "bitbucket": 
                (this.manager.content as ConfigBitbucket)[key as keyof ConfigBitbucket] = value as keyof ConfigBitbucket; 
                break;
            case "server": 
                (this.manager.content as ConfigServer)[key as keyof ConfigServer] = value as never;
                break;
            default: throw new Error("Uknown type config!");
        };
    }

    public saveAll() {
        this.manager.save();
    }

    public checkValidation() {
        const base_template = `ERROR in ${this.type} config:`;

        if (!this.manager.content || Object.keys(this.manager.content).length === 0) 
            throw new Error(`${base_template} config is empty! Tip: run setup to fill it.`);

        switch (this.type) {
            case "server":
                if (!this.getProperty("cvs")) throw new Error(`${base_template} Control version system not found!`);
                if (!this.getProperty("port")) throw new Error(`${base_template} Port not found!`)
                if (!this.getProperty("timer_interval")) throw new Error(`${base_template} Timer interval not found!`)
                if (!this.getProperty("minutes_difference")) throw new Error(`${base_template} Minutes difference not found!`)
                break;
            case "git":
                if (!this.getProperty("username")) throw new Error(`${base_template} Username not found!`);
                if (!this.getProperty("repo")) throw new Error(`${base_template} Repository URL not found!`);
                if (!this.getProperty("branch")) throw new Error(`${base_template} Branch not found!`);
                break;
            case "bitbucket":
                if (!this.getProperty("workspace")) throw new Error(`${base_template} workspace not found!`);
                if (!this.getProperty("repo_slug")) throw new Error(`${base_template} Repository slug not found!`);
                if (!this.getProperty("branch")) throw new Error(`${base_template} Branch not found!`);
                if (!this.getProperty("access_token")) throw new Error(`${base_template} Access token not found!`);
                break;
            default: throw new Error("Uknown type config!");
        }
    }
}
