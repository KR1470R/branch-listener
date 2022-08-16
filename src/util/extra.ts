export const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

export const getBaseDir = () => {
    console.log("current dir:", process.cwd());
    if (!process.env.BRANCH_LISTENER_MAIN_DIR) 
        throw new Error("Unrecognized branch listener root path! Please, reinstall the program!")
    if (process.cwd() === "/")
        return `${process.env.BRANCH_LISTENER_MAIN_DIR}/`;
    else if (process.cwd().endsWith("/branch-listener")) {
        return `${process.cwd()}/`;
    } else return `${process.env.BRANCH_LISTENER_MAIN_DIR}/`;
}
