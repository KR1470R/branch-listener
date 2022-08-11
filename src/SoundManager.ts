import player from "play-sound";

export class SoundManager {
    private readonly base_path: string = "./assets/sounds/";
    private volume: number;
    private player: any;

    constructor(volume: number) {
        this.player = player({});

        if (volume <= 50 && volume > 0) {
            this.volume = 10000;
        } else if (volume >= 50 && volume < 70) {
            this.volume = 25000;
        } else if (volume >= 70) {
            this.volume = 32768;
        } else {
            this.volume = 0;
        }
    }

    public play(name: string) {
        console.log(`Playing ${name} (vol. ${this.volume})`);
        this.player.play(`${this.base_path}${name}`, { mpg123: ["-f", this.volume] });
    }
}
