import Listener from "./Listener";
import { 
    ConfigGithub, 
    ConfigServer
} from "../util/types";

export default class GithubListener extends Listener {

    constructor(config: ConfigGithub, config_server: ConfigServer) {
        super(
            "github", 
            config, 
            config_server, 
            {
                headers: {
                    "Content-Type": "application/vnd.github+json",
                    "Access-Control-Allow-Origin": "*",
                    "Authorization": `token ${config.token}`
                }
            }
        );
    }
}
