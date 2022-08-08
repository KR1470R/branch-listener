import readline from "readline";
import { stdin, stdout } from 'process';
import JSONManager from "./util/JSONManager";
import { Config } from "./util/types";

const input = readline.createInterface(stdin, stdout);
const default_config = new JSONManager("./configs/default_config.json").content as Config;
const user_config_manager = new JSONManager("./configs/user_config.json");
const user_config = user_config_manager.content as Config;

const quiz = () => {
    return new Promise(resolve => {
        input.question("Enter Username: ", (answ: any) => {
            if (!answ) throw new Error("Username is nessessary!");
            user_config.username = answ;

            input.question("Enter repository name: ", (answ: any) => {
                if (!answ) throw new Error("Repository name is nessesary!");
                user_config.repo = answ;

                input.question(`Enter branch name(default ${default_config.branch}): `, (answ: any) => {
                    if (answ) user_config.branch = answ;
                    else user_config.branch = default_config.branch;

                    input.question(`Enter timer interval(default ${default_config.timer_interval}ms): `, (answ: any) => {
                        if (answ) {
                            if (!(/^\d+$/.test(answ))) 
                                throw new Error("Timer must contain only digits! Try again.");
                            user_config.timer_interval = Number(answ);
                        }
                        else user_config.timer_interval = default_config.timer_interval;

                        input.question(`Enter port(default ${default_config.port}): `, (answ: any) => {
                            if (answ) {
                                user_config.port = Number(answ);
                                if (!(/^\d+$/.test(answ))) 
                                    throw new Error("Port must contain only digits! Try again.");
                            }
                            else user_config.port = default_config.port;

                            resolve(1);
                        });
                    });
                });
            });
        });
    });
}

quiz()
    .then(() => {
        user_config_manager.save();
        console.log("branch-listener setup has been finished successfully.");
        input.close();
    });
