import axios from "axios";
import { ConfigBitbucket, ConfigServer } from "./util/types";

export default class BitbucketListener {
    
    private config: ConfigBitbucket;
    private config_server: ConfigServer; 
    private axios_config: object;

    constructor(config: ConfigBitbucket, config_server: ConfigServer) {
        this.config = config;
        this.config_server = config_server;
        this.axios_config = {
            headers: {
                "Authorization": `Bearer ${this.config.access_token}`,
                "Accept": "application/json"
            }
        };
    }

    public isSoundNewCommit() {}
}