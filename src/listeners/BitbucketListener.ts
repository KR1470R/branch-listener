import Listener from "./Listener";
import { ConfigBitbucket, ConfigServer } from "../util/types";
import { SoundManager } from "../util/SoundManager";
import Logger from "../util/Logger";

export default class BitbucketListener extends Listener {
  constructor(
    id: number,
    config: ConfigBitbucket,
    config_server: ConfigServer,
    soundManager: SoundManager,
    logger: Logger
  ) {
    super(
      "bitbucket",
      id,
      config,
      config_server,
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        auth: {
          username: config.username,
          password: config.app_password,
        },
      },
      soundManager,
      logger
    );
  }
}
