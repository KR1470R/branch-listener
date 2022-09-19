import notifier from "node-notifier";
import { getBaseDir } from "./extra";
import { supportableCVS } from "./types";

export default class NotificationManager {
  private base_dir_icons: string;
  private icon_path: string;

  constructor(cvs_name: supportableCVS) {
    this.base_dir_icons = `${getBaseDir()}assets/icons/`;
    this.icon_path = `${this.base_dir_icons}${cvs_name}.png`;
  }

  public notify(title: string, message: string) {
    notifier.notify(
      {
        title,
        message,
        sound: false,
        icon: this.icon_path,
        wait: true,
      },
      (err: unknown) => {
        if (err) console.log("NOTIFICATION POPUP ERROR:", err);
      }
    );
  }
}
