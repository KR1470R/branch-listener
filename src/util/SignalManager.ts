import { SignalCallbackType } from "./types";

export default class SignalManager {
  private callbacks: SignalCallbackType[];
  private normal_exit_signals = ["SIGINT", "SIGUSR1", "SIGUSR2"];
  private error_exit_signals = ["uncaughtException", "unhandledRejection"];

  constructor() {
    this.callbacks = [];
  }

  public addCallback(callback: SignalCallbackType) {
    this.callbacks.push(callback);
  }

  public listenEvents(exit: boolean) {
    let status_code: 0 | 1 = 0;

    for (const normal_signal of this.normal_exit_signals) {
      process.on(normal_signal, async () => {
        for (const callback of this.callbacks) {
          await callback();
        }
        process.exit(status_code);
      });
    }

    for (const error_signal of this.error_exit_signals) {
      process.on(error_signal, async (err) => {
        for (const callback of this.callbacks) {
          await callback(`${err.stack}`);
        }
        status_code = 1;
        process.exit(status_code);
      });
    }
    if (exit) process.exit(status_code);
  }
}
