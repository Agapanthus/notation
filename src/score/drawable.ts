import { BeatType, SpacedBeat } from "./beat";
import { DrawingMusicContext, MusicContext } from "./musicContext";
import { MusicFraction } from "./musicFraction";
import { SVGTarget } from "./svg";

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
