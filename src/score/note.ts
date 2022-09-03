import { accidentalNames, accsPadding } from "./accidental";
import { BeatType, SpacedBeat } from "./beat";
import { Drawable, NewGroup } from "./drawable";
import {
    getEngravingDefaults,
    getGlyphDim,
    getGlyphWidth,
    getSMUFLUni,
    lineThicknessMul,
    spatium2points,
} from "./fonts";
import { MusicContext } from "./musicContext";
import { MusicFraction } from "./musicFraction";
import { fraction2name } from "./rest";
import { SVGTarget } from "./svg";
import { assert, average, linearRegression } from "./util";

// TODO: arbitrary constant
const defaultInterNote = 0.3;

// TODO: arbitrary constant
const dDotMul = 1.5;

// TODO: arbitrary constant
const minStemLength = 1;
const minStemLengthOver = 0.125;
const minStemLengthFlags = 0.75;

// TODO: arbitrary constant
const dotAfterNote = 0.1;

// To make the stems look nice at noteheads. This is empirical.
const noteHeadStemCorrectionFactor = 0.05;

export const symbolicNoteDurations = {
    "𝅜": 0.5,
    "𝅝": 1,
    "𝅗𝅥": 2,
    "♩": 4,
    "♪": 8,
    "𝅘𝅥𝅯": 16,
    "𝅘𝅥𝅰": 32,
    "𝅘𝅥𝅱": 64,
    "𝅘𝅥𝅲": 128,
    "♬": 16,
    "♫": 16,
};

const noteHeads = {
    "0.5": "noteheadDoubleWhole",
    "1": "noteheadWhole",
    "2": "noteheadHalf",
    "4": "noteheadBlack",
};

export class Note extends Drawable {
    // midi-pitch
    protected pitch: number = 69;
    // list of accidentals to put in front
    protected accidentals: string[] = [];
    // line in system
    protected line: number = 0;

    // duration, i.e. 0.5,1,2,4,8 ...
    protected duration: number = 4;
    // number of duration-dots
    protected dots: number = 0;

    constructor(note) {
        super(BeatType.Note, MusicFraction.fromDots(note.duration, note.dots));

        this.line = note.line;
        this.pitch = note.pitch;
        if (note.accs && note.accs.length > 0) this.accidentals = [note.accs];
        this.duration = note.duration;
        this.dots = note.dots;

        this.len = MusicFraction.fromDots(this.duration, this.dots);
    }

    get hasBeams() {
        return this.duration >= 8;
    }

    public beats(): MusicFraction {
        return MusicFraction.fromDots(this.duration, this.dots);
    }

    private measured = false;
    public measure(ctx: MusicContext): void {
        assert(!this.measured, "can only measure once");
        this.measured = true;

        this.measureAccidentals();
        this.measureHeadAndFlags(ctx.hasBeamgroup);
        Note.measureDots(this, this.dots);

        this.before = 0;
        this.after = defaultInterNote;
    }

    static drawStem(ctx: SVGTarget, x: number, yl: number, w: number, stemL: number) {
        const dx = getEngravingDefaults().stemThickness * lineThicknessMul;
        let w0 = w - dx / 2;
        const upwards = stemL < 0;
        if (!upwards) {
            w0 = dx / 2;
        }
        ctx.drawLine(
            x + w0,
            yl + noteHeadStemCorrectionFactor * Math.sign(stemL),
            x + w0,
            yl + stemL,
            dx
        );
        return w0;
    }

    // use Math.floor to get the "natural" number
    static numberOfLedgerLines(l: number) {
        if (l <= -2) {
            return -l / 2;
        }
        if (l >= 10) {
            return (l - 8) / 2;
        }
        return 0;
    }

    static drawLedgerLines(ctx: SVGTarget, x: number, y: number, l: number, w: number) {
        const le = getEngravingDefaults().legerLineExtension * spatium2points;
        // TODO: depends on system!
        if (l <= -2) {
            for (let i = -2; i >= l; i -= 2) {
                ctx.drawLine(
                    x - le / 2,
                    y + i * 0.125,
                    x + w + le / 2,
                    y + i * 0.125,
                    getEngravingDefaults().legerLineThickness * lineThicknessMul
                );
            }
        }
        if (l >= 10) {
            for (let i = 10; i <= l; i += 2) {
                ctx.drawLine(
                    x - le / 2,
                    y + i * 0.125,
                    x + w + le / 2,
                    y + i * 0.125,
                    getEngravingDefaults().legerLineThickness * lineThicknessMul
                );
            }
        }
    }

    private measureAccidentals() {
        const l = this.getL();
        if (this.accidentals.length > 0) {
            this.spaceAddPreGlyph(accidentalNames[this.accidentals[0]], 0.125 * l);
            this.spaceAddPre(accsPadding);
        }
    }

    static drawAccidentals(ctx: SVGTarget, x: number, yl: number, accidentals: string[]) {
        // draws the accidentals _before_ the given x

        // TODO: Draw all accidentals. Or should there only be one?
        if (accidentals.length > 0) {
            const w0 = getGlyphWidth(accidentalNames[accidentals[0]]);
            ctx.drawText(x - w0 - accsPadding, yl, getSMUFLUni(accidentalNames[accidentals[0]]));
        }
    }

    static measureDots(self: SpacedBeat, dots: number) {
        if (dots > 0) {
            const dDot = getGlyphWidth("augmentationDot") * dDotMul;
            self.spaceAdd(dots * dDot + dotAfterNote);
        }
    }

    static drawDots(ctx: SVGTarget, x: number, y: number, w: number, l: number, dots: number) {
        if (dots > 0) {
            const dDot = getGlyphWidth("augmentationDot") * dDotMul;
            x += dotAfterNote;
            for (let i = 0; i < dots; i++) {
                ctx.drawText(
                    x + w,
                    y + 0.125 * (l + ((l + 1) % 2)),
                    getSMUFLUni("augmentationDot")
                );
                x += dDot;
            }
        }
        return x;
    }

    private measureHeadAndFlags(drawBeams: boolean) {
        const l = this.getL();
        const upwards = Note.getStemDirection(l) < 0;
        const notehead = Note.getNotehead(this.duration);

        // note head and flag widths
        const w0 = getGlyphWidth(notehead);
        let w1 = 0;
        if (this.duration >= 8 && !drawBeams)
            w1 = getGlyphWidth(Note.flagName(this.duration, upwards));
        if (upwards) this.spaceAdd(w0 + w1);
        else this.spaceAdd(Math.max(w0, w1));

        // note head size
        const r = getGlyphDim(notehead);
        this.spaceAddTop(r.t + 0.125 * l);
        this.spaceAddBot(r.b + 0.125 * l);

        // ledger line extension protection
        /*if (Note.numberOfLedgerLines(l) > 0) {
            let count = 0;
            if (dots > 0) count++;
            if (accs > 0) count++;
            fd.add(((getEngravingDefaults().legerLineExtension * spatium2points) / 2) * count);
            fd.pre = Math.max(
                fd.pre,
                (getEngravingDefaults().legerLineExtension * spatium2points) / 2
            );
        }*/

        // add flag height
        if (!drawBeams && this.duration >= 8) {
            const r = getGlyphDim(Note.flagName(this.duration, upwards));
            const sll = 0.125 * l + Note.getStemLength(l, this.duration);
            this.spaceAddTop(r.t + sll);
            this.spaceAddBot(r.b + sll);
        }

        // add stem length
        if (!drawBeams || this.duration < 8) {
            const sll = 0.125 * l + Note.getStemLength(l, this.duration);
            this.spaceVerticalPoint(sll);
        }
    }

    static flagName(duration: number, upwards: boolean): string {
        assert(duration >= 8, "this note doesn't have flags", duration);
        return "flag" + fraction2name[duration] + (upwards ? "Up" : "Down");
    }

    static getStemDirection(l: number): number {
        return l > 3 ? -1 : 1;
    }

    static getStemLength(l: number, d: number): number {
        // the length of stem to be used with flags

        let stemL = minStemLength;

        // Create longer stems if there are too many flags / ledger lines
        stemL = Math.max(
            stemL,
            minStemLengthOver + 2 * 0.125 * Note.numberOfLedgerLines(l)

            // flags are placed on-top; we don't care about this
            //+ flagWidth * duration2beams(d)
        );

        return stemL * Note.getStemDirection(l);
    }

    static drawStemWithFlags(
        ctx: SVGTarget,
        x: number,
        yl: number,
        l: number,
        w: number,
        duration: number
    ) {
        // TODO: Create longer stems if there are too many beams / flags / ledger lines

        const stemL = Note.getStemLength(l, duration);
        const w0 = Note.drawStem(ctx, x, yl, w, stemL);

        // flags
        if (duration >= 8) {
            const stemWidth = getEngravingDefaults().stemThickness * lineThicknessMul;
            ctx.drawText(
                x + w0 - stemWidth / 2,
                yl + stemL,
                getSMUFLUni(Note.flagName(duration, Note.getStemDirection(l) < 0))
            );
        }
    }

    static getNotehead(duration: number): string {
        return noteHeads[duration <= 2 ? duration : "4"];
    }

    public getL(): number {
        // TODO: clef specific!
        const clefLine = 45;
        // effective note line
        const l = clefLine - this.line;

        return l;
    }

    public draw(can: SVGTarget, ctx: MusicContext) {
        const l = this.getL();
        // determine y positions
        const yl = 0.125 * l;

        // accidentals
        Note.drawAccidentals(can, 0, yl, this.accidentals);

        // TODO: Support other note-head shapes!
        const noteHead = Note.getNotehead(this.duration);
        const w = getGlyphWidth(noteHead);

        // Ledger lines
        Note.drawLedgerLines(can, 0, 0, l, w);

        // Note head
        can.drawText(0, yl, getSMUFLUni(noteHead));

        if (this.duration >= 2) {
            if (ctx.hasBeamgroup && this.duration >= 8) {
                ctx.beamgroupPush(0, 0, w, this.duration, l, yl, can);
            } else {
                // Stem
                Note.drawStemWithFlags(can, 0, yl, l, w, this.duration);
            }
        }

        // Dots
        Note.drawDots(can, 0, 0, w, l, this.dots);
    }
}
