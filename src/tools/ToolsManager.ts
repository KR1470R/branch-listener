import { FSHierarchyCheck, FSHierarchyRestore } from "../util/FSHierarchyObserver";
import ListenerManager from "../listeners/ListenerManager";
import express from "express";
import ConfigFactory from "../util/ConfigFactory";
import { supportableCVS } from "../util/types";
import { Quiz } from "../util/Quiz";
import { onCloseEvent } from "../util/extra";

export default class ToolsManager {

    private listenerManager: ListenerManager;
    private cvs_name?: supportableCVS;
    private id?: number;

    /**
     * @param isBegining true if branch-listener runs setup.
     * @param cvs_name?
     * @param id?
     */
    constructor(
        isBegining: boolean, 
        cvs_name?: supportableCVS | undefined, 
        id?: number | undefined
    ) {
        this.listenerManager = new ListenerManager();

        this.cvs_name = cvs_name;
        this.id = id;

        if (isBegining) FSHierarchyRestore();
        else FSHierarchyCheck();
    }

    public async init() {
        await this.listenerManager.init();
    }

    public async setup() {
        const quiz = new Quiz();

        const finish = () => {
            quiz.closePrompt();
            return Promise.resolve(1);
        }
    
        const definedCVSQuiz = {
            "github": quiz.github.bind(quiz),
            "bitbucket": quiz.bitbucket.bind(quiz),
            "gitlab": quiz.gitlab.bind(quiz),
        };
    
        const user_specified_cvs = await quiz.prompt(
            "Choose Control Version System(github/bitbucket/gitlab): ",
            (output: string | undefined) => {
                if (
                    !output ||
                    !Object.keys(definedCVSQuiz).includes(output!.toLocaleLowerCase())
                ) throw new Error("Uknown control version system. Try again.");
            }
        ) as keyof typeof definedCVSQuiz;

        await definedCVSQuiz[user_specified_cvs](true);

        await quiz.server(true, finish);
    }

    public async add() {

    }

    public async start() {
        console.log("[start]")
        const config_server = new ConfigFactory("server");
        await config_server.init();
        console.log(`Running with config: ${JSON.stringify({
            ...config_server.getAllProperties(),
        }, null, "\t")}\n`);

        const app = express();

        const server = app.listen(config_server.getProperty(0, "port"), () => {
            this.listenerManager.startListen();
        });

        onCloseEvent(server.close.bind(server));
    }

    public async stop() {
        if (!this.cvs_name || !this.id) throw new Error("CVS name or id was not specified!");
        return this.listenerManager.stopListener(this.cvs_name, this.id);
    }

    public async remove() {
        if (!this.cvs_name || !this.id) throw new Error("CVS name or id was not specified!");
        return this.listenerManager.killListener(this.cvs_name, this.id);
    }

    public async list() {
        console.log(this.listenerManager.getAllListListeners());
    }
}
