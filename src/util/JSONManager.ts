import fs from "fs";

export default class JSONManager {
    
    public path!: string;
    public content!: object;

    constructor (path: string) {
        this.path = path;

        this.content = JSON.parse(fs.readFileSync(this.path, {encoding: "utf8", flag: "r"}));
    }

    public save() {
        fs.writeFileSync(this.path, JSON.stringify(this.content, null, '\t'));
    }
}
