import { BeatType } from "./beat";
import { Drawable } from "./drawable";
import { DrawingMusicContext, MusicContext } from "./musicContext";
import { MusicFraction } from "./musicFraction";
import { SVGTarget } from "./svg";

export class Space extends Drawable {
    constructor(w: number, after: number = 0, aff: number = 0) {
        super(BeatType.Empty, new MusicFraction());
        this.width = w;
        this.after = after;
        this.aff = aff;
    }

    public draw(can: SVGTarget, ctx: DrawingMusicContext) {
        // pass
    }

    public render(ctx: MusicContext) {
        // already filled in constructor
    }
}
