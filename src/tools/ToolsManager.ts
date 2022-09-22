import {
  FSHierarchyCheck,
  FSHierarchyRestore,
} from "../util/FSHierarchyObserver";
import ListenerManager from "../listeners/ListenerManager";
import express from "express";
import ConfigFactory from "../util/ConfigFactory";
import { ConfigServer, supportableCVS } from "../util/types";
import { Quiz } from "../util/Quiz";
import { signalManager } from "../util/extra";
import axios from "axios";

export default class ToolsManager {
  private listenerManager: ListenerManager;
  private cvs_name?: supportableCVS;
  private id?: number;
  private key?: string;
  private value?: string;
  private isBegining: boolean;

  /**
   * @param isBegining true if branch-listener runs setup.
   * @param cvs_name? Name of CVS to interact with.
   * @param id? ID of config of specified CVS.
   * @param key? Key of specified config. Must be specified to use tool edit.
   * @param value? Value that need to replace with value of specified key of config. Must be specified to use tool edit.
   */
  constructor(
    isBegining: boolean,
    cvs_name?: supportableCVS | undefined,
    id?: number | undefined,
    key?: string | undefined,
    value?: string | undefined
  ) {
    this.isBegining = isBegining;
    this.listenerManager = new ListenerManager();

    this.cvs_name = cvs_name;
    this.id = id;
    this.key = key;
    this.value = value;

    if (this.isBegining) FSHierarchyRestore();
    else FSHierarchyCheck();
  }

  public async init() {
    if (this.isBegining) return Promise.resolve();

    await this.listenerManager.init();
  }

  public async setup() {
    const quiz = new Quiz();

    const finish = () => {
      quiz.closePrompt();
      return Promise.resolve();
    };

    const definedCVSQuiz = {
      github: quiz.github.bind(quiz),
      bitbucket: quiz.bitbucket.bind(quiz),
      gitlab: quiz.gitlab.bind(quiz),
    };

    const user_specified_cvs = (await quiz.prompt(
      "Choose Control Version System(github/bitbucket/gitlab): ",
      (output: string | undefined) => {
        if (
          !output ||
          !Object.keys(definedCVSQuiz).includes(output!.toLocaleLowerCase())
        )
          throw new Error("Uknown control version system. Try again.");
      }
    )) as keyof typeof definedCVSQuiz;

    await definedCVSQuiz[user_specified_cvs](true);

    await quiz.server(true, finish);

    return Promise.resolve(true);
  }

  public async run() {
    const config_server = new ConfigFactory("server");
    await config_server.init();
    const server_properties = await config_server.getAllProperties(0);
    console.log(
      `Running BRANCH-LISTENER-SERVER with config: ${JSON.stringify(
        {
          ...server_properties,
        },
        null,
        "\t"
      )}\n`
    );

    const app = express();

    app.get("/restart", async (req, res) => {
      const response = "Restarted by user.";
      await this.listenerManager.stopAllListeners(true, response);
      await this.listenerManager.activateAllListeners(true);
      res.send(response);
    });

    const port = await config_server.getProperty(0, "port");

    const server = app.listen(port, async () => {
      await this.listenerManager.spawnAllListeners();
    });

    signalManager.addCallback(server.close.bind(server));

    return Promise.resolve(false);
  }

  public async add() {
    const quiz = new Quiz();

    const definedCVSQuiz = {
      github: quiz.github.bind(quiz),
      bitbucket: quiz.bitbucket.bind(quiz),
      gitlab: quiz.gitlab.bind(quiz),
    };

    if (!this.cvs_name || !Object.keys(definedCVSQuiz).includes(this.cvs_name))
      return Promise.reject("Uknown cvs name!");

    await definedCVSQuiz[this.cvs_name](false);

    quiz.closePrompt();
    return Promise.resolve(1);
  }

  public async start() {
    if (!this.checkCVSData()) {
      await this.listenerManager.activateAllListeners();
      return Promise.resolve(true);
    }

    await this.listenerManager.activateListenerStatus(this.cvs_name!, this.id!);

    return Promise.resolve(true);
  }

  public async restart() {
    const config_server = new ConfigFactory("server");
    await config_server.init();
    const server_properties = (await config_server.getAllProperties(
      0
    )) as ConfigServer;
    await axios.get(`http://localhost:${server_properties.port}/restart`);

    console.log("Restarted by user.");
    return Promise.resolve(true);
  }

  public async stop() {
    const reason = "Stopped by user.";

    if (this.checkCVSData())
      await this.listenerManager.stopListener(
        this.cvs_name!,
        this.id!,
        true,
        reason
      );
    else await this.listenerManager.stopAllListeners(true, reason);

    return Promise.resolve(true);
  }

  public async remove() {
    if (this.checkCVSData())
      await this.listenerManager.killListener(this.cvs_name!, this.id!);
    return Promise.resolve(true);
  }

  public list() {
    if (this.checkCVSData(true)) {
      this.listenerManager.getListListeners(this.cvs_name!).printTable();
    } else {
      for (const key of this.listenerManager.listeners_keys) {
        console.log(`\n${key.toUpperCase()}:`);
        this.listenerManager.getListListeners(key).printTable();
      }
    }

    return Promise.resolve(true);
  }

  private checkCVSData(onlyCVS = false, withLogs = true) {
    const log = (msg: string) => {
      if (withLogs) console.log(`WARNING: ${msg}`);
    };

    if (!this.cvs_name) {
      log("CVS name was not specified!");
      return 0;
    }

    if (!onlyCVS && !this.id && typeof this.id !== "number") {
      log("Id was not specified!");
      return 0;
    }

    return 1;
  }

  public async edit() {
    if (!this.checkCVSData()) return Promise.resolve(true);

    await this.listenerManager.setListenerMeta(
      this.cvs_name!,
      this.id!,
      this.key!,
      this.value!
    );

    return Promise.resolve(true);
  }
}
