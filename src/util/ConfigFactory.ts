import { 
    ConfigServer, 
    ConfigGit, 
    ConfigBitbucket,
    Configs
} from "../util/types";
import JSONManager from "./JSONManager";

export default class ConfigFactory {
    
    private readonly base_path: string = "../../configs/";
    private config_name!: string;
    public type: "git" | "bitbucket" | "server";
    public manager!: JSONManager;
    public content!: Configs;

    constructor(config_type: "git" | "bitbucket" | "server", isDefault = false) {
        this.type = config_type;
        this.config_name = isDefault ? "default_config.json" : "config.json";
        this.manager = new JSONManager(`${this.base_path}${this.type}/${this.config_name}`);
    }

    public getProperty(key: string) {
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
}
