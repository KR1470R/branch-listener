import Listener from "./Listener";
import { ConfigGitlab, ConfigServer } from "../util/types";
import { SoundManager } from "../util/SoundManager";
import Logger from "../util/Logger";

export default class GitlabListener extends Listener {
  constructor(
    id: number,
    config: ConfigGitlab,
    config_server: ConfigServer,
    soundManager: SoundManager,
    logger: Logger
  ) {
    super(
      "gitlab",
      id,
      config,
      config_server,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "PRIVATE-TOKEN": config.token,
        },
      },
      soundManager,
      logger
    );
  }
}
