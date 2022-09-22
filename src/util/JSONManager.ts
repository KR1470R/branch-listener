import fs from "fs";
import {
  isArrayHasAnyEmptyObject,
  signalManager,
  Events,
  isArraysEqual,
} from "./extra";
import { supportable_configs } from "./types";
import Crypto from "./Crypto";

export default class JSONManager {
  public path!: string;
  private contents!: object[];
  private content_backup!: object[];
  private base_template = {
    all: [{}],
  };
  private watcher!: fs.FSWatcher;
  private saved_by_self = false;
  private type?: supportable_configs;
  private crypto: Crypto;

  constructor(path: string, type?: supportable_configs | undefined) {
    this.path = path;
    this.type = type;
    this.crypto = new Crypto();
  }

  public async init() {
    await this.overrideIfNotValidFile();

    const file = this.crypto.decode(
      fs.readFileSync(this.path, { encoding: "utf8", flag: "r" })
    );

    if (file) this.contents = JSON.parse(file)["all"];
    else this.contents = this.base_template["all"];

    //update file if it has been changed
    this.watcher = fs.watch(this.path, "utf8", (event: string) => {
      if (this.saved_by_self) return;
      if (event === "change") {
        const new_file = this.crypto.decode(
          fs.readFileSync(this.path, { encoding: "utf8", flag: "r" })
        );
        if (new_file) {
          const new_contents = JSON.parse(new_file)["all"];
          if (isArraysEqual(this.contents, new_contents)) return;

          this.contents = new_contents;

          if (this.type) Events.emit(`${this.type}_updated`, this.contents);
        }
      }
    });

    signalManager.addCallback(this.watcher.close.bind(this.watcher));
  }

  public get content() {
    return this.contents;
  }

  public set content(content) {
    this.contents = content;
  }

  private checkValidation() {
    if (!fs.existsSync(this.path)) return false;

    const file = fs.readFileSync(this.path, { encoding: "utf8", flag: "r" });
    if (!file) return false;

    return true;
  }

  private overrideIfNotValidFile(): Promise<void> {
    return new Promise((resolve, reject) => {
      const isValid = this.checkValidation();

      if (!isValid) {
        fs.writeFile(this.path, JSON.stringify(this.base_template), (err) => {
          if (err) reject(err);
          resolve();
        });
      } else resolve();
    });
  }

  public async save(override: boolean, skipClear = false) {
    if (!override && !skipClear) await this.clearEmptyAndPendingObjects();

    if (override) {
      await fs.promises.writeFile(this.path, "");
      this.base_template.all = [this.contents[0]];
    } else this.base_template.all = this.contents;

    this.saved_by_self = true;

    await fs.promises.writeFile(
      this.path,
      this.crypto.encode(JSON.stringify(this.base_template)),
      {
        encoding: "utf-8",
        flag: "w",
      }
    );

    setTimeout(() => {
      this.saved_by_self = false;
    }, 2000);
    return Promise.resolve();
  }

  public clearEmptyAndPendingObjects() {
    return new Promise<void>((resolve) => {
      if (Array.isArray(this.contents)) {
        this.contents = this.contents.filter((obj) => {
          if (Object.keys(obj).length === 0) return false;
          if (obj["status" as keyof typeof obj] === "pending") return false;
          return true;
        });
      }

      resolve();
    });
  }

  public async removeSpecifiedObject(id: number) {
    if (!this.contents[id]) throw new Error("element is undefined");

    this.contents.splice(id, 1);

    await this.save(false);

    return Promise.resolve();
  }

  public isEmpty() {
    return (
      !this.contents ||
      this.contents.length === 0 ||
      isArrayHasAnyEmptyObject(this.contents)
    );
  }

  public closeWatcher() {
    this.watcher.close();
  }
}
