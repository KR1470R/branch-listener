export const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

export const getBaseDir = () => {
    if (process.cwd() === "/" && process.env.BRANCH_LISTENER_MAIN_DIR)
        return `${process.env.BRANCH_LISTENER_MAIN_DIR}/`;
    else return `${process.cwd()}/`;
}
