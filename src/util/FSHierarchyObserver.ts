import { getBaseDir } from "./extra";
import fs from "fs";

const base_dir = getBaseDir();

/**
 * Runs only in setup, to automatically create all nessesary dirs.
 * Creates needed dir if it not found.
 */
export async function FSHierarchyRestore(): Promise<void> {
    await _createIfNotExistConfigs();
    await _createIfNotExistJournals();

    return Promise.resolve();
}

const _createIfNotExistConfigs = async (): Promise<void> => {
    const configs_base_dir = `${base_dir}configs/`;
    const all_configs_dirs = ["server", "github", "bitbucket", "gitlab"];
    
    for (const config_dir of all_configs_dirs) {
        _createIfNotExist(`${configs_base_dir}${config_dir}/`);
    }
}

const _createIfNotExistJournals = async (): Promise<void> => {
    const journal_base_dir = `${base_dir}journal/`;
    const all_journals_dirs = ["github", "bitbucket", "gitlab"];

    for (const journal of all_journals_dirs) {
        _createIfNotExist(`${journal_base_dir}${journal}/logs`);
    }
}

const _createIfNotExist = async (path: string): Promise<void> => {
    if (!fs.existsSync(path))
        await fs.mkdir(path, {recursive: true}, err => {
            if (err) throw err; 
        });
}


/**
 * Runs wherever to check compatibility of file system to work branch-listener properly.
 * Throws an error if any of needed folder does not exist.
 */
export function FSHierarchyCheck() {
    _throwIfConfigsDirNotExist();
    _throwIfJournalsDirNotExist();
    _throwIfAssetsDirNotExist();
}

const _throwIfConfigsDirNotExist = (): never | void => {
    const configs_base_dir = `${base_dir}configs/`;
    const all_configs_dirs = ["server", "github", "bitbucket", "gitlab"];

    for (const config_dir of all_configs_dirs) {
        _throwIfNotExist(`${configs_base_dir}${config_dir}/`);
    }
}

const _throwIfJournalsDirNotExist = (): never | void => {
    const journal_base_dir = `${base_dir}journal/`;
    const all_journals_dirs = ["github", "bitbucket", "gitlab"];

    for (const journal of all_journals_dirs) {
        _throwIfNotExist(`${journal_base_dir}${journal}/logs`)
    }
}

const _throwIfAssetsDirNotExist = (): never | void => {
    const assets_base_dir = `${base_dir}assets/`;
    const icons_dir = `${assets_base_dir}icons`;
    const sounds_dir = `${assets_base_dir}sounds`;

    _throwIfNotExist(icons_dir);
    _throwIfNotExist(sounds_dir);

    const icons = fs.readdirSync(icons_dir);
    const sounds = fs.readdirSync(sounds_dir);

    if (icons.length < 3) throw new Error("icons not enough!");
    if (sounds.length < 1) throw new Error("sounds not enough!");
}

const _throwIfNotExist = (path: string) => {
    if (!fs.existsSync(path))
        throw new Error(`${path} not found!`);
}
