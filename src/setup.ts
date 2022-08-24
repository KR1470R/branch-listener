import readline from "readline";
import { stdin, stdout } from 'process';
import ConfigFactory from "./util/ConfigFactory";

const input = readline.createInterface(stdin, stdout);

const default_config_server = new ConfigFactory("server", true);
const config_server = new ConfigFactory("server", false);

const quiz_server = (resolve: Function) => {
    return new Promise(() => {
        input.question(`Enter port(default ${default_config_server.getProperty("port")}): `, (answ: any) => {
            if (answ) {
                if (!(/^\d+$/.test(answ))) 
                    throw new Error("Port must contain only digits! Try again.");
                config_server.setProperty("port", answ);
            } else config_server.setProperty("port", default_config_server.getProperty("port"));

            input.question(`Enter timer interval(default ${default_config_server.getProperty("timer_interval")}ms): `, (answ: any) => {
                if (answ) {
                    if (!(/^\d+$/.test(answ))) 
                        throw new Error("Timer must contain only digits! Try again.");
                    if (answ < 60000)
                        throw new Error("Timer must be larger or equal 60s. Please increase it!");

                    config_server.setProperty("timer_interval", Number(answ));
                } else
                    config_server
                        .setProperty("timer_interval", default_config_server.getProperty("timer_interval"));
                input.question(
                    `Enter minutes difference between commit publish(default ${default_config_server.getProperty("minutes_difference")}): `,
                    (answ: any) => {
                        if (answ) {
                            if (!(/^\d+$/.test(answ))) 
                                throw new Error("Minutes difference must contain only digits! Try again.");
                            
                            config_server.setProperty("minutes_difference", Number(answ));
                        } else
                            config_server
                                .setProperty(
                                    "minutes_difference", 
                                    default_config_server.getProperty("minutes_difference")
                                );

                        input.question(`Enter volume sound(default ${default_config_server.getProperty("volume")}): `, (answ: any) => {
                            if (answ) {
                                if (!(/^\d+$/.test(answ))) 
                                    throw new Error("Volume must contain only digits! Try again.");
                                
                                config_server.setProperty("volume", Number(answ));
                            } else
                                config_server
                                    .setProperty(
                                        "volume", 
                                        default_config_server.getProperty("volume")
                                    );

                            config_server.saveAll();
                            resolve(1);
                        });
                    }
                );
            }); 
        });
    })
}

const quiz_github = (resolve: Function) => {
    return new Promise(() => {
        config_server.setProperty("cvs", "github");

        const github_config = new ConfigFactory("github");

        input.question("Enter username: ", (answ: any) => {
            if (!answ) throw new Error("Username is nessessary!");
            github_config.setProperty("username", answ);

            input.question("Entrer access token: ", (answ: any) => {
                if (!answ) throw new Error("Access token is neccessary");
                github_config.setProperty("token", answ);
                
                input.question("Enter repository name: ", (answ: any) => {
                    if (!answ) throw new Error("Repository name is necessary!");
                    github_config.setProperty("repo", answ);
    
                    input.question(`Enter branch name: `, (answ: any) => {
                        if (!answ) throw new Error("Branch name is necessary!"); 
                        github_config.setProperty("branch", answ);
    
                        github_config.saveAll();
                        quiz_server(resolve);
                    });
                });
            });
        });
    });
}

const quiz_bibucket = (resolve: Function) => {
    return new Promise(() => {
        config_server.setProperty("cvs", "bitbucket");

        const bitbucket_config = new ConfigFactory("bitbucket");

        input.question("Enter username: ", (answ: any) => {
            if (!answ) throw new Error("Username is nessessary!");
            bitbucket_config.setProperty("username", answ);

            input.question("Enter app password: ", (answ: any) => {
                if (!answ) throw new Error("App password is nessessary!");
                bitbucket_config.setProperty("app_password", answ);

                input.question("Enter workspace name: ", (answ: any) => {
                    if (!answ) throw new Error("Workspace name is necessary!");
                    bitbucket_config.setProperty("workspace", answ);
        
                    input.question("Enter repository slug: ", (answ: any) => {
                        if (!answ) throw new Error("Repository slug is necessary!");
                        bitbucket_config.setProperty("repo_slug", answ);
        
                        input.question(`Enter branch name: `, (answ: any) => {
                            if (!answ) throw new Error("Branch name is necessary!"); 
                            bitbucket_config.setProperty("branch", answ);
        
                            bitbucket_config.saveAll();
                            quiz_server(resolve);
                        });
                    });
                });
            });
        });
    });
}

const quiz_gitlab = (resolve: Function) => {
    return new Promise(() => {
        config_server.setProperty("cvs", "gitlab");

        const gitlab_config = new ConfigFactory("gitlab");

        input.question("Enter project ID: ", (answ: any) => {
            if (!answ) throw new Error("Project ID is nessessary!");
            gitlab_config.setProperty("project_id", answ);

            input.question("Enter token: ", (answ: any) => {
                if (!answ) throw new Error("Token is nessessary!");
                gitlab_config.setProperty("token", answ);

                input.question(`Enter branch name: `, (answ: any) => {
                    if (!answ) throw new Error("Branch name is necessary!"); 
                    gitlab_config.setProperty("branch", answ);

                    gitlab_config.saveAll();
                    quiz_server(resolve);
                });
            });
        });
    });
}

const narroving = () => {
    return new Promise(resolve => {
        input.question("Choose Control Version System(github/bitbucket/gitlab): ", (answ: any) => {
            if (answ) {
                if (String(answ).toLowerCase() === "github") return quiz_github(resolve);
                else if (String(answ).toLowerCase() === "bitbucket") return quiz_bibucket(resolve);
                else if (String(answ).toLowerCase() == "gitlab") return quiz_gitlab(resolve)
                else throw new Error("Uknown control version system. Try again.");
            } else throw new Error("Unrecognizable input data. Try again.")
        });
    });
}

narroving()
    .then(res => {
        console.log("branch-listener setup has been finished successfully.");
        input.close();
    });
