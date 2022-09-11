import JSONManager from "./JSONManager";
import { getBaseDir } from "./extra";
import { ListenerMeta, ListenerStatus, supportableCVS } from "./types";

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

    public getListenerStatus(cvs_name: supportableCVS, id: number): ListenerStatus | never {
        if (this.isListenerExist(cvs_name, id)) {
            const target_manager = this.managers[cvs_name];
            return (target_manager.content[id] as ListenerMeta).status;
        } else throw new Error(`Listener ${cvs_name}:id doesn't exist!`);
    }

    public setListenerStatus(cvs_name: supportableCVS, id: number, status: ListenerStatus) {
        if (!this.isListenerExist(cvs_name, id)) {
            console.log(`can't change status of the listener with id ${id} - not found!`);
            return;
        }

        const target_manager = this.managers[cvs_name];
        (target_manager.content[id] as ListenerMeta).status = status;
        target_manager.save(true);
    }

    public addListener(cvs_name: supportableCVS, listener_meta: ListenerMeta, override = false) {
        const target_manager = this.managers[cvs_name];

        if (override) target_manager.content = [listener_meta];
        else {
            if (this.isListenerExist(cvs_name, listener_meta.id)) {
                // console.log(`listener with id ${listener_meta.id} is already exist!`);
                return;
            }

            target_manager.content.push(listener_meta);
        }
        
        target_manager.save(override);
    }

    public removeListener(cvs_name: supportableCVS, id: number) {
        if (this.isEmpty(cvs_name)) throw new Error(`${cvs_name} journal is empty!`);

        if (!this.isListenerExist(cvs_name, id)) {
            console.log(`can't remove listener with id ${id} - not found!`);
            return;
        }

        this.managers[cvs_name].removeSpecifiedObject(id);
    }

    public isEmpty(cvs_name: supportableCVS) {
        return this.managers[cvs_name].isEmpty();
    }

    private isListenerExist(cvs_name: supportableCVS, id: number) {
        const target_manager = this.managers[cvs_name];

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
    
    public getListenersJournal(cvs_name: supportableCVS) {
        return this.managers[cvs_name].content as ListenerMeta[];
    }

    public closeWatcher(cvs_name: supportableCVS) {
        this.managers[cvs_name].closeWatcher();
    }
}
