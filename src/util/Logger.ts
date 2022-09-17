import { supportableCVS } from "./types"
import { getBaseDir, getDateType, parseDate } from "./extra";
import fs, { fstatSync } from "fs";

export default class Logger {

    private type: supportableCVS;
    private base_path: string;
    private file_name: string;
    private target_file: string;

    constructor (type: supportableCVS, id: number) {
        this.type = type;
        this.file_name = `${type}_${id}.log`;
        this.base_path = `${getBaseDir()}logs/`;
        this.target_file = `${this.base_path}${this.file_name}`;
    }

    public async init(): Promise<void> {
        if (!fs.existsSync(this.base_path)) {
            console.log("created folder");
            await fs.mkdir(this.base_path, { recursive: true }, err => {
                if (err)
                    throw err;
            });
        }

        if (!fs.existsSync(this.target_file)) {
            console.log("created", this.target_file);
            await fs.writeFile(this.target_file, "", "utf8", err => {
                if (err)
                    throw err;
            });
        }
    }

    public log(message: any, ...other_messages: any[]): void {
        this.throwIfUndefinedFile();

        const content = `${this.date} => ${String(message)} ${other_messages.join(" ")}`;
        console.log(content);
        fs.appendFileSync(this.target_file, `\n${content}`, "utf8");
    }

    public logNewLine() {
        this.throwIfUndefinedFile();
        fs.appendFileSync(this.target_file, `\n`, "utf8");
    }

    public throw(err_msg: string): never {
        this.log(err_msg);
        throw new Error(err_msg);
    }

    public clear(): void {
        this.throwIfUndefinedFile();
        fs.writeFileSync(this.target_file, "", "utf8");
    }

    private throwIfUndefinedFile() {
        if (!fs.existsSync(this.base_path))
            throw new Error(`${this.base_path} not found!`);

        if (!fs.existsSync(this.target_file))
            throw new Error(`${this.target_file} not found!`);
    }

    private get date() {
        const date_all = new Date();
        return parseDate(getDateType(date_all));
    }
}