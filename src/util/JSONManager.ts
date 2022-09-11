import fs from "fs";
import { isArrayHasAnyEmptyObject, onCloseEvent } from "./extra";

export default class JSONManager {
    
    public path!: string;
    private contents!: object[];
    private content_backup!: object[];
    private base_template = {
        all: [
            {

            }
        ]
    };
    private watcher!: fs.FSWatcher;

    constructor (path: string) {
        this.path = path;
    }

    public async init() {
        await this.overrideIfNotValidFile();

        const file = fs.readFileSync(this.path, {encoding: "utf8", flag: "r"});
        if (file) this.contents = JSON.parse(file)["all"];
        else this.contents = this.base_template["all"];

        this.content_backup = JSON.parse(JSON.stringify(this.contents));

        //update file if it has been changed
        this.watcher = fs.watch(this.path, "utf8", (event: string) => {
            if (event === "change") {
                const new_file = fs.readFileSync(this.path, {encoding: "utf8", flag: "r"});
                if (new_file) this.contents = JSON.parse(new_file)["all"];
            }
        });

        onCloseEvent(() => this.watcher.close.bind(this.watcher));
    }

    public get content() {
        return this.contents;
    }
    
    public set content(content) {
        this.contents = content;
    }

    private checkValidation() {
        if (!fs.existsSync(this.path)) return false;

        const file = fs.readFileSync(this.path, {encoding: "utf8", flag: "r"});
        if (!file) return false;

        return true;
    }

    private overrideIfNotValidFile(): Promise<void> {
        return new Promise((resolve, reject) => {
            const isValid = this.checkValidation();

            if (!isValid) {
                fs.writeFile(this.path, JSON.stringify(this.base_template), err => {
                    if (err) reject(err);
                    resolve();
                });
            } else resolve();
        });
    }

    public save(override: boolean) {
        if (Object.keys(this.base_template.all[0]).length === 0) 
            this.base_template.all.pop();

        this.clearEmptyObjects();

        if (override) this.base_template.all = this.contents;
        else this.base_template.all = this.base_template.all.concat(this.contents);
        fs.writeFileSync(this.path, JSON.stringify(this.base_template, null, '\t'));
    }

    private clearEmptyObjects() {
        if (Array.isArray(this.contents)) {
            for (const obj of this.contents) {
                if (
                    typeof obj !== "object" ||
                    !Object.keys(obj).length 
                ) {
                    this.contents.slice(
                        this.contents.indexOf(obj),
                        1
                    );
                }
            }
        }
    }

    public removeSpecifiedObject(id: number) {
        if (!this.contents[id])
            throw new Error("element is undefined");
        
        this.contents.splice(
            id,
            1
        );
        
        this.save(true);
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
