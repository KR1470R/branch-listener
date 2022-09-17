import readline from "readline";
import { stdin, stdout } from 'process';
import ConfigFactory from "./ConfigFactory";
import { 
    default_config_server,
    base_config_id,
    ListenerMeta,
    supportableCVS
} from "./types";

export class Quiz {
    
    private input: readline.Interface;

    constructor() {
        this.input = readline.createInterface(stdin, stdout);
    }

    public prompt(question: string, callbackCheck: Function, default_answer?: any) {
        return new Promise((resolve) => {
            this.input.question(question, (answer: any) => {
                if (!answer) {
                    if (default_answer) resolve(String(default_answer));
                    else callbackCheck(answer);
                } else
                    callbackCheck(answer);
                    resolve(answer);
            });
        });
    }
    
    public closePrompt() {
        this.input.close();
    }

    public async server(override: boolean, resolve?: Function) {
        const config_server = new ConfigFactory("server");

        await config_server.init();
    
        const user_port = await this.prompt(
            `Enter port(default ${default_config_server.port}): `,
            (output: any) => {
                if (!(/^\d+$/.test(output))) 
                    throw new Error("Port must contain only digits! Try again.");
            },
            default_config_server.port
        );
        await config_server.setProperty(base_config_id, "port", user_port as string);
    
        const user_time_interval = await this.prompt(
            `Enter timer interval(default ${default_config_server.timer_interval}ms): `,
            (output: any) => {
                if (!(/^\d+$/.test(String(output)))) 
                    throw new Error("Timer must contain only digits! Try again.");
                if (Number(output) < 60000)
                    throw new Error("Timer must be larger or equal 60s. Please increase it!");
            },
            default_config_server.timer_interval
        );
        await config_server.setProperty(base_config_id, "timer_interval", Number(user_time_interval));
    
        const user_minutes_difference = await this.prompt(
            `Enter minutes difference between commit publish(default ${default_config_server.minutes_difference}): `,
            (output: any) => {
                if (!(/^\d+$/.test(String(output)))) 
                    throw new Error("Minutes difference must contain only digits! Try again.");
            },
            default_config_server.minutes_difference
        );
        await config_server.setProperty(base_config_id, "minutes_difference", Number(user_minutes_difference));
    
        const user_volume_sound = await this.prompt(
            `Enter volume sound(default ${default_config_server.volume}): `,
            (output: any) => {
                if (!(/^\d+$/.test(String(output)))) 
                    throw new Error("Volume must contain only digits! Try again.");
            },
            default_config_server.volume
        );
        await config_server.setProperty(base_config_id, "volume", Number(user_volume_sound));
    
        await config_server.saveAll(override);
        
        if (resolve) resolve(1);
    }

    public async github(override: boolean, resolve?: Function) {
        const cvs_name = "github";
        const github_config = new ConfigFactory(cvs_name);
        await github_config.init();
    
        const username = await this.prompt(
            "Enter username: ",
            (output: string | undefined) => {
                if (!output) throw new Error("Username is nessessary!");
            }
        );
        await github_config.setProperty(base_config_id, "username", String(username));
    
        const token = await this.prompt(
            "Entrer access token: ",
            (output: string | undefined) => {
                if (!output) throw new Error("Access token is neccessary");
            }
        );
        await github_config.setProperty(base_config_id, "token", String(token));
    
        const repository_name = await this.prompt(
            "Enter repository name: ",
            (output: string | undefined) => {
                if (!output) throw new Error("Repository name is necessary!");
            }
        );
        await github_config.setProperty(base_config_id, "repo", String(repository_name));
    
        const branch_name = await this.prompt(
            "Enter branch name: ",
            (output: string | undefined) => {
                if (!output) throw new Error("Branch name is necessary!"); 
            }
        );
        await github_config.setProperty(base_config_id, "branch", String(branch_name));
        
        await github_config.saveAll(override);
        
        if (resolve) resolve(1);
    }

    public async bitbucket(override: boolean, resolve?: Function) {
        const cvs_name = "bitbucket";
        const bitbucket_config = new ConfigFactory(cvs_name);
        await bitbucket_config.init();
    
        const username = await this.prompt(
            "Enter username: ",
            (output: string | undefined) => {
                if (!output) throw new Error("Username is nessessary!");
            }
        );
        await bitbucket_config.setProperty(base_config_id, "username", String(username));
    
        const app_password = await this.prompt(
            "Enter app password: ",
            (output: string | undefined) => {
                if (!output) throw new Error("App password is nessessary!");
            }
        );
        await bitbucket_config.setProperty(base_config_id, "app_password", String(app_password));
    
        const workspace_name = await this.prompt(
            "Enter workspace name: ",
            (output: string | undefined) => {
                if (!output) throw new Error("Workspace name is necessary!");
            }
        );
        await bitbucket_config.setProperty(base_config_id, "workspace", String(workspace_name));
    
        const repository_slug = await this.prompt(
            "Enter repository slug: ",
            (output: string | undefined) => {
                if (!output) throw new Error("Repository slug is necessary!");
            }
        );
        await bitbucket_config.setProperty(base_config_id, "repo_slug", String(repository_slug));
    
        const branch_name = await this.prompt(
            "Enter branch name: ",
            (output: string | undefined) => {
                if (!output) throw new Error("Branch name is necessary!"); 
            }
        );

        await bitbucket_config.setProperty(base_config_id, "branch", String(branch_name));
        
        await bitbucket_config.saveAll(override);

        if (resolve) resolve(1);
    }

    public async gitlab(override: boolean, resolve?: Function) {
        const cvs_name = "gitlab";
        const gitlab_config = new ConfigFactory(cvs_name);
        await gitlab_config.init();
    
        const id = override ? 0 : gitlab_config.getLastCVSConfigId();

        console.log("ID:", id, override)
        
        if (gitlab_config.isEmptySpecified(id))
            await gitlab_config.addEmptyTemplateCVSConfig(id);

        await gitlab_config.setProperty(id, "id", id);

        const project_id = await this.prompt(
            "Enter project ID: ",
            (output: string | undefined) => {
                if (!output) throw new Error("Project ID is nessessary!");
            }
        );
        await gitlab_config.setProperty(id, "project_id", String(project_id));
    
        const token = await this.prompt(
            "Enter token: ",
            (output: string | undefined) => {
                if (!output) throw new Error("Token is nessessary!");
            }
        );
        await gitlab_config.setProperty(id, "token", String(token));
    
        const branch_name = await this.prompt(
            "Enter branch name: ",
            (output: string | undefined) => {
                if (!output) throw new Error("Branch name is necessary!"); 
            }
        );

        await gitlab_config.setProperty(id, "branch", String(branch_name));
        
        await gitlab_config.saveAll(override);

        if (resolve) resolve(1);
    }
}
