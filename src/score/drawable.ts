import { BeatType, SpacedBeat } from "./beat";
import { MusicContext } from "./musicContext";
import { MusicFraction } from "./musicFraction";
import { SVGTarget } from "./svg";

export abstract class Drawable extends SpacedBeat {
    constructor(t: BeatType, len: MusicFraction) {
        super(t, len);
    }

    abstract measure(ctx: MusicContext): void;

    abstract draw(can: SVGTarget, ctx: MusicContext): void;
}

export class NewGroup extends Drawable {
    constructor() {
        super(BeatType.Empty, new MusicFraction());
    }

    public draw(can: SVGTarget, ctx: MusicContext) {
        // TODO
    }

    public measure(ctx: MusicContext) {}
}
