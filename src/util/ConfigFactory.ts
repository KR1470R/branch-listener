import {
  ConfigServer,
  ConfigGithub,
  ConfigBitbucket,
  ConfigGitlab,
  supportable_configs,
  ConfigsCVS,
  AllConfigs,
  ListenerStatus,
  valid_configs_keys,
} from "../util/types";
import JSONManager from "./JSONManager";
import { getBaseDir, isArrayHasAnyEmptyObject } from "./extra";

export default class ConfigFactory {
  private readonly base_path: string = `${getBaseDir()}configs/`;
  private config_name;
  public type: supportable_configs;
  public manager!: JSONManager;

  constructor(config_type: supportable_configs) {
    this.type = config_type;
    if (this.type === "server") {
      this.config_name = "config.json";
    } else this.config_name = "config";
  }

  public async init() {
    this.manager = new JSONManager(
      `${this.base_path}${this.type}/${this.config_name}`,
      this.type as supportable_configs
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

  private getConfigById(id: number) {
    const allConfigs = this.getAllConfigs();
    const filteredConfigs = (allConfigs as AllConfigs[]).filter((config) => {
      if (this.type === "server") return true;
      return (config as ConfigsCVS).id === id;
    });
    if (filteredConfigs.length === 0) throw new Error("Config not found!");

    return filteredConfigs[0] as AllConfigs;
  }

  public defineConfig(id: number) {
    const definedConfig = this.getConfigById(id);

    return definedConfig;
  }

  public getProperty(id: number, key: string) {
    const config = this.defineConfig(id);

    return config[key as keyof typeof config];
  }

  public getAllProperties(id: number) {
    return this.defineConfig(id);
  }

  public setProperty(id: number, key: string, value: string | number) {
    const config = this.defineConfig(id);

    config[key as keyof typeof config] = value as keyof typeof config;
  }

  public async saveAll(override: boolean) {
    await this.manager.save(override);
  }

  private getKeys(id: number): string[] {
    return Object.keys(this.getConfigById(id));
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
      const configs_id = (this.getAllConfigs() as ConfigsCVS[]).map(
        (config) => config.id
      );

      for (const config_id of configs_id) {
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
    const config_id = (this.getAllConfigs() as ConfigsCVS[]).indexOf(
      this.getConfigById(id) as ConfigsCVS
    );

    await this.manager.removeSpecifiedObject(config_id);
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

    if (this.manager.content.length === 0)
      this.manager.content.push(configs_template);
    else this.manager.content.splice(id, 0, configs_template);

    await this.manager.save(!Boolean(id), true);
  }

  public async setStatusListener(id: number, status: ListenerStatus) {
    // if (this.isListenerExist(id))
    //     throw new Error(`Config ${this.type}:${id} not found!`);

    const config = this.defineConfig(id) as ConfigsCVS;

    config.status = status;

    await this.manager.save(false);

    return Promise.resolve();
  }

  public async getStatusListener(id: number) {
    return (await String(this.getProperty(id, "status"))) as ListenerStatus;
  }

  public isListenerExist(id: number) {
    const config = this.defineConfig(id);

    if (config) return true;
    else return false;
  }

  public async clearEmptyAndPendingObjects(withSave: boolean) {
    await this.manager.clearEmptyAndPendingObjects();

    if (withSave) await this.manager.save(false);
  }
}
