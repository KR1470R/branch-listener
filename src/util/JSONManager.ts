import fs from "fs";
import { isArrayHasAnyEmptyObject } from "./extra";

export default class JSONManager {
    
    public path!: string;
    public content!: object[];
    private content_backup!: object[];
    private base_template = {
        all: [
            {

            }
        ]
    };

    constructor (path: string) {
        this.path = path;
    }

    public async init() {
        await this.overrideIfNotValidFile();

        const file = fs.readFileSync(this.path, {encoding: "utf8", flag: "r"});
        if (file) this.content = JSON.parse(file)["all"];
        else this.content = this.base_template["all"];

        this.content_backup = JSON.parse(JSON.stringify(this.content));
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

        if (override) this.base_template.all = this.content;
        else this.base_template.all = this.base_template.all.concat(this.content);
        fs.writeFileSync(this.path, JSON.stringify(this.base_template, null, '\t'));
    }

    private clearEmptyObjects() {
        if (Array.isArray(this.content)) {
            for (const obj of this.content) {
                if (
                    typeof obj !== "object" ||
                    !Object.keys(obj).length 
                ) {
                    this.content.slice(
                        this.content.indexOf(obj),
                        1
                    );
                }
            }
        }
    }

    public removeSpecifiedObject(id: number) {
        if (!this.content[id])
            throw new Error("element is undefined");
        
        this.content.splice(
            id,
            1
        );
        
        this.save(true);
    }

    public isEmpty() {
        return (
            !this.content ||
            this.content.length === 0 ||
            isArrayHasAnyEmptyObject(this.content)
        );
    }

}
