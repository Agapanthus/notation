import { getGlyphAdvance } from "./fonts";
import { SVGTarget } from "./svg";
import { assert } from "./util";

export const restDurations = {
    "𝄺": 0,
    "𝄻": 1,
    "𝄼": 2,
    "𝄽": 4,
    "𝄾": 8,
    "𝄿": 16,
    "𝅀": 32,
    "𝅁": 64,
    "𝅂": 128,
};

export const fraction2name = {
    "0.5": "DoubleWhole",
    "1": "Whole",
    "2": "Half",
    "4": "Quarter",
    "8": "8th",
    "16": "16th",
    "32": "32nd",
    "64": "64th",
    "128": "128th",
    "256": "256th",
    "512": "512nd",
    "1024": "1024th",
};

export class Rest {
    private duration = 0;
    private dots = 0;

    constructor(note: any) {
        assert(note.type == "rest", "input must be a rest");

        this.duration = note.duration;
        assert(
            this.duration >= 0 && this.duration <= 1024,
            "rest duration is weird: " + this.duration
        );

        this.dots = note.dots;
    }

    public draw(ctx: SVGTarget, x: number, y: number) {
        let uniPoint = parseInt("E4E2", 16);

        const restName = "rest" + fraction2name[this.duration + ""];
        if (this.duration > 0) uniPoint += 1 + Math.log2(this.duration);
        const w = getGlyphAdvance(restName);

        ctx.drawText(x, y + 0.125 * 4, String.fromCodePoint(uniPoint));

        // Dots
        if (this.dots > 0) {
            // TODO: arbitrary constant
            const dDot = 0.12;
            ctx.drawText(x + w + dDot, y + 0.125 * 5, "\uE1E7 ".repeat(this.dots));
            x += dDot * this.dots;
        }

        // TODO: arbitrary constant
        return x + w + 0.2;
    }
}
