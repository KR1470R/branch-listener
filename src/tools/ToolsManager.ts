import { FSHierarchyCheck, FSHierarchyRestore } from "../util/FSHierarchyObserver";
import ListenerManager from "../listeners/ListenerManager";
import express from "express";
import ConfigFactory from "../util/ConfigFactory";
import { supportableCVS } from "../util/types";
import { Quiz } from "../util/Quiz";
import { signalManager } from "../util/extra";

export default class ToolsManager {

    private listenerManager: ListenerManager;
    private cvs_name?: supportableCVS;
    private id?: number;
    private isBegining: boolean;

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
        this.isBegining = isBegining;
        this.listenerManager = new ListenerManager();

        this.cvs_name = cvs_name;
        this.id = id;

        if (this.isBegining) FSHierarchyRestore();
        else FSHierarchyCheck();
    }

    public async init() {
        if (this.isBegining) return Promise.resolve();
        
        await this.listenerManager.init();
    }

    public async setup() {
        const quiz = new Quiz();

        const finish = () => {
            quiz.closePrompt();
            return Promise.resolve(1);
        };
    
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

        return Promise.resolve(true);
    }

    public async add() {
        const quiz = new Quiz();

        const definedCVSQuiz = {
            "github": quiz.github.bind(quiz),
            "bitbucket": quiz.bitbucket.bind(quiz),
            "gitlab": quiz.gitlab.bind(quiz),
        };

        if (
            !this.cvs_name ||
            !Object.keys(definedCVSQuiz).includes(this.cvs_name)
        ) return Promise.reject("Uknown cvs name!");

        await definedCVSQuiz[this.cvs_name](false);

        quiz.closePrompt();
        return Promise.resolve(1);
    }

    public async start() {
        const config_server = new ConfigFactory("server");
        await config_server.init();
        const server_properties = await config_server.getAllProperties();
        console.log(`Running with config: ${JSON.stringify({
            ...server_properties,
        }, null, "\t")}\n`);

        const app = express();

        const port = await config_server.getProperty(0, "port");

        const server = app.listen(port, () => {
            this.listenerManager.startListen();
        });

        signalManager.addCallback(server.close.bind(server));
        
        return Promise.resolve(false);
    }

    public async stop() {
        if (this.checkCVSData())
            await this.listenerManager.stopListener(this.cvs_name!, this.id!);
        return Promise.resolve(true);
    }

    public async remove() {
        if (this.checkCVSData())
            await this.listenerManager.killListener(this.cvs_name!, this.id!);
        return Promise.resolve(true);
    }

    public async list() {
        console.log(this.listenerManager.getAllListListeners());
        return Promise.resolve(true);
    }

    private checkCVSData() {
        if (!this.cvs_name) {
            console.log("CVS name was not specified!");
            return 0;
        }

        if (!this.id && typeof this.id !== "number") {
            console.log("Id was not specified!");
            return 0;
        }

        return 1;
    }
}
