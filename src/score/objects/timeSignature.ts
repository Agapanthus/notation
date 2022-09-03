import { BeatType } from "../util/beat";
import { Drawable } from "./drawable";
import { DrawingMusicContext, MusicContext } from "../context/musicContext";
import { MusicFraction } from "../util/musicFraction";
import { SVGTarget } from "../backends/svg";
import { getGlyphWidth, getSMUFLUni } from "../util/fonts";
import { sum } from "../util/util";

export type TimeSignatureModifier = "" | "Large" | "Small" | "Narrow" | "Turned" | "Reversed";

export class TimeSignature extends Drawable {
    constructor(
        protected t: MusicFraction,
        protected symbol = true,
        protected modifier: TimeSignatureModifier = ""
    ) {
        super(BeatType.Note, new MusicFraction());
    }

    private getNum(): { n: string[]; d: string[] } {
        let n: string[] = [];
        let d: string[] = [];
        if (this.symbol && this.t.x == 4 && this.t.y == 4) {
            // "timeSigCommon" = "common time" = 4/4
            n = ["Common"];
        } else if (this.symbol && this.t.x == 2 && this.t.y == 2) {
            // "timeSigCutCommon" = "alla breve" = 2/2
            n = ["CutCommon"];

            // THere are more! timeSigCut3, timeSigCut2, and many parenthesis, slash and stuff
        } else {
            n = this.t.x.toString().split("");
            d = this.t.y.toString().split("");
        }
        return {
            n: n.map((x) => "timeSig" + x + this.modifier),
            d: d.map((x) => "timeSig" + x + this.modifier),
        };
    }

    public draw(can: SVGTarget, ctx: DrawingMusicContext) {
        const { n, d } = this.getNum();

        const wn = sum(n.map((x) => getGlyphWidth(x)));
        const wd = sum(d.map((x) => getGlyphWidth(x)));
        const dx = (wd - wn) / 2;

        if (d.length == 0) {
            can.drawText(0, 0.125 * 4, n.map(getSMUFLUni).join(""));
        } else {
            can.drawText(dx > 0 ? +dx : 0, 0.125 * 2, n.map(getSMUFLUni).join(""));
            can.drawText(dx > 0 ? 0 : -dx, 0.125 * 6, d.map(getSMUFLUni).join(""));
        }
    }

    public render(ctx: MusicContext) {
        // already filled in constructor

        const { n, d } = this.getNum();
        const wn = sum(n.map((x) => getGlyphWidth(x)));
        const wd = sum(d.map((x) => getGlyphWidth(x)));
        this.width = Math.max(wn, wd);
        this.after = 0.1; // TODO
    }
}
