import {
  ConfigServer,
  ConfigGithub,
  ConfigBitbucket,
  ConfigGitlab,
  supportable_configs,
  ConfigsCVS,
  ListenerStatus,
  valid_configs_keys,
} from "../util/types";
import JSONManager from "./JSONManager";
import { getBaseDir, isArrayHasAnyEmptyObject } from "./extra";

export default class ConfigFactory {
  private readonly base_path: string = `${getBaseDir()}configs/`;
  private config_name = "config.json";
  public type: supportable_configs;
  public manager!: JSONManager;

  constructor(config_type: supportable_configs) {
    this.type = config_type;
  }

  public async init() {
    this.manager = new JSONManager(
      `${this.base_path}${this.type}/${this.config_name}`
    );
    await this.manager.init();
  }

  public get configsArray() {
    return this.manager.content;
  }

  public get name() {
    return this.type;
  }

  public getAllConfigs() {
    switch (this.type) {
      case "server":
        return this.manager.content as ConfigServer[];
      case "github":
        return this.manager.content as ConfigGithub[];
      case "bitbucket":
        return this.manager.content as ConfigBitbucket[];
      case "gitlab":
        return this.manager.content as ConfigGitlab[];
      default:
        throw new Error("Uknown type config!");
    }
  }

  public defineConfig(id = 0) {
    const definedConfig = this.getAllConfigs()[id];

    return definedConfig;
  }

  public getProperty(id = 0, key: string): Promise<number | string> {
    const config = this.defineConfig(id);
    return config[key as keyof typeof config];
  }

  public getAllProperties(id = 0) {
    return this.defineConfig(id);
  }

  public setProperty(id = 0, key: string, value: string | number) {
    const config = this.defineConfig(id);
    config[key as keyof typeof config] = value as keyof typeof config;
  }

  public async saveAll(override: boolean) {
    await this.manager.save(override);
  }

  private getKeys(id = 0): string[] {
    return Object.keys(this.manager.content[id]);
  }

  public async checkValidation() {
    const base_template = `Invalid ${this.type} config:`;

    if (this.type === "server") {
      if (this.isEmptySpecified(0))
        throw new Error(`${base_template} config is empty!`);

      const config_parameters = this.getKeys(0);

      for (const valid_key of valid_configs_keys[this.type]) {
        if (config_parameters.indexOf(valid_key) === -1)
          throw new Error(`Key ${valid_key} not found in ${this.type}`);
      }

      for (const key of config_parameters) {
        const config_key = await this.getProperty(0, key);
        if (!config_key)
          throw new Error(
            `${base_template} Parameter ${
              config_parameters[Number(key)]
            } not found!`
          );
      }
    } else {
      for (
        let config_id = 0;
        config_id <= this.manager.content.length - 1;
        config_id++
      ) {
        const cvs_parameters = this.getKeys(config_id);

        for (const valid_key of valid_configs_keys[this.type]) {
          if (cvs_parameters.indexOf(valid_key) === -1)
            throw new Error(`Key ${valid_key} not found in ${this.type}`);
        }

        for (const key of cvs_parameters) {
          const config_value = await this.getProperty(config_id, key);
          if (typeof config_value === "undefined")
            throw new Error(
              `${base_template} Parameter ${
                cvs_parameters[Number(key)]
              } not found!`
            );
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

  public getLastCVSConfigId() {
    if (this.type === "server" || this.manager.content.length === 0) return 0;

    const definedConfig = this.manager.content[
      this.manager.content.length
    ] as ConfigsCVS;

    if (definedConfig) return definedConfig["id"];
    else return this.manager.content.length;
  }

  public async addEmptyTemplateCVSConfig(id: number) {
    const configs_template = {
      id,
      status: "pending",
    };

    if (!this.manager) throw new Error("JSON manager was not initilized!");

    this.manager.content.splice(id, 0, configs_template);

    await this.manager.save(false);
  }

  public async setStatusListener(id: number, status: ListenerStatus) {
    // if (this.isListenerExist(id))
    //     throw new Error(`Config ${this.type}:${id} not found!`);

    const config = this.defineConfig(id) as ConfigsCVS;

    config.status = status;

    await this.manager.save(false);

    return Promise.resolve();
  }

  public isListenerExist(id: number) {
    const config = this.defineConfig(id);

    if (config) return true;
    else return false;
  }
}
