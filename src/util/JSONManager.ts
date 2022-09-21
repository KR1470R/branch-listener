import fs from "fs";
import {
  isArrayHasAnyEmptyObject,
  signalManager,
  Events,
  isArraysEqual,
  isUTF8,
} from "./extra";
import { supportable_configs, cryptoType } from "./types";
import base64 from "base-64";
import utf8 from "utf8";

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

  constructor(path: string, type?: supportable_configs | undefined) {
    this.path = path;
    this.type = type;
  }

  public async init() {
    await this.overrideIfNotValidFile();

    const file = fs.readFileSync(this.path, { encoding: "utf8", flag: "r" });
    if (file) this.contents = JSON.parse(file)["all"];
    else this.contents = this.base_template["all"];

    this.cryptoAll("decode");

    //update file if it has been changed
    this.watcher = fs.watch(this.path, "utf8", (event: string) => {
      if (this.saved_by_self) return;
      if (event === "change") {
        const new_file = fs.readFileSync(this.path, {
          encoding: "utf8",
          flag: "r",
        });
        if (new_file) {
          const new_contents = JSON.parse(new_file)["all"];
          if (isArraysEqual(this.contents, new_contents)) return;

          this.contents = new_contents;

          this.cryptoAll("decode");

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

    this.cryptoAll("encode");

    if (override) {
      await fs.promises.writeFile(this.path, "");
      this.base_template.all = [this.contents[0]];
    } else this.base_template.all = this.contents;

    this.saved_by_self = true;

    await fs.promises.writeFile(
      this.path,
      JSON.stringify(this.base_template, null, "\t"),
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

  // encode or decode cvs configs.
  private crypto(data: string, type: cryptoType): string {
    let bytes;
    let result;
    switch (type) {
      case "decode":
        if (!isUTF8(data)) data = this.crypto(data, "encode");
        bytes = base64.decode(data);
        result = utf8.decode(bytes);
        break;
      case "encode":
        bytes = utf8.encode(data);
        result = base64.encode(bytes);
        break;
    }
    return result;
  }

  private cryptoAll(type: cryptoType) {
    if (this.type === "server") return;

    const keys_ignore = ["id", "status"];

    for (const obj of this.contents) {
      for (const key in obj) {
        type key_of = keyof typeof obj;
        if (keys_ignore.includes(key)) continue;
        obj[key as key_of] = this.crypto(obj[key as key_of], type) as key_of;
      }
    }
  }
}
