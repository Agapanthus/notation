import { BeatType } from "../util/beat";
import { Drawable } from "./drawable";
import { getGlyphAdvance } from "../util/fonts";
import { DrawingMusicContext, MusicContext } from "../context/musicContext";
import { MusicFraction } from "../util/musicFraction";
import { Note } from "./note";
import { SVGTarget } from "../backends/svg";
import { assert } from "../util/util";

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
    "512": "512th",
    "1024": "1024th",
};

// TODO: shouldn't be constant
const defaultRestPos = 0.125 * 4;
const defaultRestSpacing = 0.2;

export class Rest extends Drawable {
    private duration = 0;
    private dots = 0;

    constructor(note: any) {
        super(BeatType.Note, MusicFraction.fromDots(note.duration, note.dots));

        assert(note.type == "rest", "input must be a rest");

        this.duration = note.duration;
        assert(
            this.duration >= 0 && this.duration <= 1024,
            "rest duration is weird: " + this.duration
        );

        this.dots = note.dots;
    }

    public beats(): MusicFraction {
        return MusicFraction.fromDots(this.duration, this.dots);
    }

    get restName(): string {
        return "rest" + fraction2name[this.duration + ""];
    }

    public render(ctx: MusicContext): void {
        this.spaceAddGlyph(this.restName, defaultRestPos);
        Note.renderDots(this, this.dots);
        this.after = defaultRestSpacing;
    }

    public draw(can: SVGTarget, ctx: DrawingMusicContext) {
        let uniPoint = parseInt("E4E2", 16);

        if (this.duration > 0) uniPoint += 1 + Math.log2(this.duration);
        const w = getGlyphAdvance(this.restName);

        can.drawText(0, defaultRestPos, String.fromCodePoint(uniPoint));

        Note.drawDots(can, 0, 0, w, 5, this.dots);
    }
}
