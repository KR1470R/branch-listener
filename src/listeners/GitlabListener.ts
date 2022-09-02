import Listener from "./Listener";
import { 
    ConfigGitlab, 
    ConfigServer
} from "../util/types";
import { SoundManager } from "../util/SoundManager";

export default class GitlabListener extends Listener {

    constructor(config: ConfigGitlab, config_server: ConfigServer, soundManager: SoundManager) {
        super(
            "gitlab", 
            config, 
            config_server, 
            {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "PRIVATE-TOKEN": config.token
                }
            },
            soundManager
        );
    }
}
