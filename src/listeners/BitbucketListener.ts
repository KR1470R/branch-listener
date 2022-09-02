import Listener from "./Listener";
import { 
    ConfigBitbucket, 
    ConfigServer
} from "../util/types";
import { SoundManager } from "../util/SoundManager";

export default class BitbucketListener extends Listener {

    constructor(config: ConfigBitbucket, config_server: ConfigServer, soundManager: SoundManager) {
        super(
            "bitbucket", 
            config, 
            config_server, 
            {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                auth: {
                    username: config.username,
                    password: config.app_password
                }
            },
            soundManager
        );
    }
}
