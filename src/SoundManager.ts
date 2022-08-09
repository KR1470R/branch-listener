import player from "node-wav-player";

export class SoundManager {
    private readonly base_path: string = "./assets/sounds/";

    constructor() {}

    public play(name: string) {

        player.play({
            path: `${this.base_path}${name}`
        })
    }
}