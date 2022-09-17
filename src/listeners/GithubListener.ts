import Listener from "./Listener";
import { ConfigGithub, ConfigServer } from "../util/types";
import { SoundManager } from "../util/SoundManager";
import Logger from "../util/Logger";

export default class GithubListener extends Listener {
  constructor(
    id: number,
    config: ConfigGithub,
    config_server: ConfigServer,
    soundManager: SoundManager,
    logger: Logger
  ) {
    super(
      "github",
      id,
      config,
      config_server,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `${config.token}`,
        },
      },
      soundManager,
      logger
    );
  }
}
