import { BeatType, SpacedBeat } from "../util/beat";
import { DrawingMusicContext, MusicContext } from "../context/musicContext";
import { MusicFraction } from "../util/musicFraction";
import { SVGTarget } from "../backends/svg";

export abstract class Drawable extends SpacedBeat {
    constructor(t: BeatType, len: MusicFraction) {
        super(t, len);
    }

    abstract render(ctx: MusicContext): void;

    abstract draw(can: SVGTarget, ctx: DrawingMusicContext): void;
}

export class NewGroup extends Drawable {
    constructor() {
        super(BeatType.Empty, new MusicFraction());
    }

    public draw(can: SVGTarget, ctx: DrawingMusicContext) {
        // TODO
    }

    public render(ctx: MusicContext) {}
}
