import JSONManager from "./JSONManager";
import { getBaseDir, isArrayHasAnyEmptyObject } from "./extra";
import { ListenerMeta, supportableCVS } from "./types";

export default class ListenersJournalManager {
    
    private readonly base_path = `${getBaseDir()}journal/`;
    private readonly file_name = "listeners.json";
    private readonly managers: {
        "github": JSONManager,
        "bitbucket": JSONManager,
        "gitlab": JSONManager
    } = {
        "github": new JSONManager(`${this.base_path}github/${this.file_name}`),
        "bitbucket": new JSONManager(`${this.base_path}bitbucket/${this.file_name}`),
        "gitlab": new JSONManager(`${this.base_path}gitlab/${this.file_name}`)
    }

    constructor() {}

    public async init() {
        for (const [name_manager, manager] of Object.entries(this.managers)) {
            await manager.init();
        }
    }

    public addListener(cvs_name: supportableCVS, listener_meta: ListenerMeta) {
        if (this.isListenerExist(cvs_name, listener_meta.id)) {
            console.log(`listener with id ${listener_meta.id} is already exist!`);
            return;
        }

        const target_manager = this.managers[cvs_name];
        target_manager.content.push(listener_meta);
        target_manager.save(false);
    }

    public removeListener(cvs_name: supportableCVS, id: number) {
        if (!this.isEmpty(cvs_name)) throw new Error(`${cvs_name} journal is empty!`);

        if (!this.isListenerExist(cvs_name, id)) {
            console.log(`can't remove listener with id ${id} - not found!`);
            return;
        }

        const target_manager = this.managers[cvs_name];

        const target_listener = target_manager.content.filter(listener => {
            return (listener as ListenerMeta).id === id;
        });

        target_manager.content.splice(
            target_manager.content.indexOf(target_listener),
            1
        );

        target_manager.save(true);
    }

    public isEmpty(cvs_name: supportableCVS) {
        return (
            !this.managers[cvs_name].content ||
            this.managers[cvs_name].content.length === 0 ||
            isArrayHasAnyEmptyObject(this.managers[cvs_name].content)
        );
    }

    private isListenerExist(cvs_name: supportableCVS, id: number) {
        const target_manager = this.managers[cvs_name];
        console.log(target_manager.content)
        const definedListenerMeta = (target_manager.content as ListenerMeta[])  
            .filter(listener => {
                if (!listener) return false;
                if (typeof listener !== "object") return false;
                if (!Object.keys(listener).length) return false;
                return listener.id === id;
            });

        if (definedListenerMeta.length) return true;
        else return false;
    }
}
