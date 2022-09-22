import { getRandomInt, getApplications } from "../util/extra";
import base64 from "base-64";
import utf8 from "utf8";

export default class Crypto {
  constructor() {}

  private _decode = (data: string) => {
    const bytes = base64.decode(data);
    const result = utf8.decode(bytes);

    return result;
  };

  public decode(content: string) {
    const regex_keys = /\*[0-9]\*/gm;

    const matched = content.match(regex_keys);
    if (!matched) return content;

    content = content.replace(regex_keys, "");

    let decode_times = 0;

    for (const key of matched) {
      const num = key.match(/[0-9]/g);
      if (num) decode_times += Number(num[0]);
    }

    let decode_result = content;

    for (let i = 0; i <= decode_times; i++) {
      decode_result = this._decode(decode_result);
    }

    return decode_result;
  }

  private defineIndexKeys = (arr: string[], keys_l: number) => {
    if (arr.length < keys_l)
      throw new Error("Array keys length less than specified array.");

    const keys: number[] = [];

    const start = 0;
    const end = arr.length;

    keys.push(start);

    for (const el of arr) {
      if (arr.indexOf(el) % 2) keys.push(arr.indexOf(el));
    }

    keys.push(end);

    const unique_keys = keys.filter(function (item, pos) {
      return keys.indexOf(item) == pos;
    });

    return unique_keys;
  };

  private _encode = (data: string) => {
    const bytes = base64.encode(data);
    const result = utf8.encode(bytes);
    return result;
  };

  public encode(content: string) {
    const encode_times = getRandomInt(3, 10);

    const applications: number[] = getApplications(encode_times);

    let encoded_result = content;

    for (let i = 0; i <= encode_times; i++) {
      encoded_result = this._encode(encoded_result);
    }

    const splitted = encoded_result.split("");
    const positions = this.defineIndexKeys(splitted, encode_times);
    for (const application of applications) {
      const pos = positions[getRandomInt(1, positions.length)];
      splitted.splice(pos, 0, `*${String(application)}*`);
    }

    encoded_result = splitted.join("");

    return encoded_result;
  }
}
