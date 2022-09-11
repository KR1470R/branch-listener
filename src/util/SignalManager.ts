export default class SignalManager {
    
    private callbacks: Function[];
    private normal_exit_signals = ["SIGINT", "SIGUSR1", "SIGUSR2"];
    private error_exit_signals = ["uncaughtException", "unhandledRejection"];

    constructor() {
        this.callbacks = [];
    }

    public addCallback(callback: Function) {
        this.callbacks.push(callback);
    }

    public listenEvents(exit: boolean) {
        let status_code: 0 | 1 = 0;

        for (const normal_signal of this.normal_exit_signals) {
            process.on(normal_signal, () => {
                this.callbacks.forEach(callback => callback());
                process.exit(status_code);
            });
        }

        for (const error_signal of this.error_exit_signals) {
            process.on(error_signal, () => {
                this.callbacks.forEach(callback => callback());
                status_code = 1;
                process.exit(status_code);
            }); 
        }
        if (exit)
            process.exit(status_code);
    }
}