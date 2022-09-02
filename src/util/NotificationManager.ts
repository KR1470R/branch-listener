import notifier from "node-notifier";
import { getBaseDir, getRandomInt } from "./extra";
import fs from "fs";

export default class NotificationManager {
    private base_dir_icons: string;
    
    constructor() {
        this.base_dir_icons = `${getBaseDir()}assets/icons/`;
    }

    public notify(title: string, message: string) {
        const icons_quantity = fs.readdirSync(this.base_dir_icons).length;
        const icon_path = `${this.base_dir_icons}cat${getRandomInt(1, icons_quantity)}.jpg`;
        notifier.notify({
            title,
            message,
            sound: false,
            icon: icon_path,
            wait: true
        }, (err: any, response: any) => {
            if (err) console.log("NOTIFICATION POPUP ERROR:", err);
        });
    }
}
