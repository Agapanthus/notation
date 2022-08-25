import { accidentalNames, accsPadding } from "./accidental";
import {
    getEngravingDefaults,
    getGlyphWidth,
    getSMUFLUni,
    lineThicknessMul,
    spatium2points,
} from "./fonts";
import { ScoreTraverser } from "./scoreTraverser";
import { SVGTarget } from "./svg";
import { assert, average, linearRegression } from "./util";

export const symbolicNoteDurations = {
    "𝅜": 0,
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
    "0": "noteheadDoubleWhole",
    "1": "noteheadWhole",
    "2": "noteheadHalf",
    "4": "noteheadBlack",
};

export interface BeamGroup {
    x: number;
    y: number;
    yl: number;
    w: number;
    beams: number;
    l: number;
}

export class BeamGroupContext {
    private note: BeamGroup[] = [];

    public push(x: number, y: number, w: number, duration: number, l: number, yl: number) {
        this.note.push({
            x,
            y,
            w,
            beams: Math.log2(duration) - 2,
            l,
            yl,
        });
    }

    private tryFindBeamDirectionsAndSlopeInBetween(
        slope: number,
        r: number
    ): { slope: number; directions: (1 | -1)[]; stemL: number } | null {
        // if the fit is to good, don't try fancy stuff
        if (Math.abs(r) > 0.3) {
            return null;
        }

        // consider placing the beam in between
        // try to partition the note heads
        // to do so, adjust the note heads using the slope and the average
        const avgYL = average(this.note.map((c) => c.yl));
        const p = this.note.map((c) => c.yl - (c.x - this.note[0].x) * slope - avgYL >= 0);

        // label of the larger partition
        const partition = p.filter(Boolean).length * 2 > p.length;
        // contents of the larger partition
        const chosenPartition = this.note.filter((x, i) => p[i] == partition);
        // label of the lower partition, i.e., if the largest l (=smallest vertical value) in the chosen one is the same as the overall minimum, the partition is also the lower partition
        const lowerPartition =
            Math.max(...chosenPartition.map((x) => x.l)) == Math.max(...this.note.map((x) => x.l))
                ? partition
                : !partition;

        // TODO: if the second partition is large enough, calculate both slopes and use the average afterwards
        const res2 = linearRegression(
            chosenPartition.map((x) => x.x),
            chosenPartition.map((x) => x.yl)
        );

        // check: can this work? Otherwise, fall back to the default
        // TODO: carefully check whether a in-between beam can fit
        let fitsInBetween = true;
        if (res2 && fitsInBetween) {
            const directions = p.map((x) => (x == lowerPartition ? -1 : 1));
            slope = res2[0];

            // TODO: choose right stem length to place it in between
            const stemL = 0.9;

            return { slope, directions, stemL };
        }

        return null;
    }

    public findBeamDirectionsAndSlope(): { slope: number; directions: (1 | -1)[]; stemL: number } {
        // determine the slope of the beams in this group using linear regression
        const res = linearRegression(
            this.note.map((x) => x.x),
            this.note.map((c) => c.yl),
            true
        );
        assert(res, "singular matrix in beam construction");
        if (!res) throw "error";
        const [slope, b, r] = res;

        // TODO: define a maximum slope, i.e., cc'' shouldn't create a very steep beam but longer stems

        const res2 = this.tryFindBeamDirectionsAndSlopeInBetween(slope, r);
        if (res2) {
            return res2;
        } else {
            const avgL = average(this.note.map((c) => c.l));
            const upwards = avgL > 3;
            let directions = this.note.map((_) => (upwards ? -1 : 1));

            // TODO: choose an appropriate stem length
            let stemL = 0.9;
            return { slope, directions, stemL };
        }
    }

    public drawBeams(ctx: SVGTarget) {
        if (this.note.length == 0) return;
        assert(this.note.length > 1, "cannot draw beams for a group with only one note");

        const { slope, directions, stemL } = this.findBeamDirectionsAndSlope();

        // TODO: if there are outliers / two vertical groups, place the beam in the middle of the note-heads!
        // TODO: for very long multi-beam (16th) groups, partially interrupt the beams (i.e., every 4 steps). Make this contrallable!
        // TODO: Move beams so they don't collide with stave lines

        // width of the note stems
        const stemWidth = getEngravingDefaults().stemThickness * lineThicknessMul;
        // get x-position of the stem relative to the note-head (depending on the direction)
        let gdx = (i: number) =>
            directions[i] < 0 ? this.note[i].w - stemWidth / 2 : stemWidth / 2;

        // TODO: increase stemL based on individual notes in the group; i.e., iterate the notes and increase it if a single note is too close

        // get y-positions of the end of the stem. The stemL is relative to the first note and direction, therefore directions[0] instead of directions[i]
        const stemEnd = (nx: number, i: number) =>
            this.note[0].yl + stemL * directions[0] + (nx - (this.note[0].x + gdx(0))) * slope;

        for (let i = 0; i < this.note.length; i++) {
            const n = this.note[i];
            // TODO: if the beam is in the middle and the flipped note used a shared secondary beam: slightly extend the length of the stem, e.g., /8c''/16cc''
            Note.drawStem(
                ctx,
                n.x,
                n.yl,
                n.w,
                Math.abs(stemEnd(n.x + gdx(i), i) - n.yl),
                directions[i] < 0
            );
        }

        // adjust the strength of the beam based on the slope
        // sqrt(x^2 + 1) = 1 / cos(atan(x))
        const adjustment = Math.sqrt(slope * slope + 1);
        const adjustedBeamWidth = beamWidth * adjustment;
        const adjustedBeamDist = beamDist * adjustment;

        // relative position of the beams
        // initially move ca. 1/2 the beam strength towards the note-heads to make sure it overlaps with the stems
        let dy = (-adjustedBeamWidth / 2) * directions[0];

        // starting x-position of beam
        const x_start = (i: number) => this.note[i].x + gdx(i) - stemWidth / 2;
        // ending x-position of beam
        const x_end = (i: number) => this.note[i].x + gdx(i) + stemWidth / 2;

        const maxBeams = Math.max(...this.note.map((x) => x.beams));
        const beamCounts = this.note.map((x) => x.beams);
        // append terminator
        beamCounts.push(0);

        for (let b = 1; b <= maxBeams; b++) {
            let j = -1;
            for (let i = 0; i < beamCounts.length; i++) {
                if (beamCounts[i] >= b) {
                    // start recording the beam group
                    if (j == -1) j = i;
                } else {
                    if (j >= 0) {
                        // draw the recorded beam group
                        let xs = x_start(j);
                        let xe = x_end(i - 1);

                        // TODO: when using a beamlet on a flipped note, choose the correct side of the beam! e.g., /8c''/16c/8c''

                        // if the beam can't connect two notes, draw a short "beam-let"
                        if (j == i - 1) {
                            xs -= shortBeamLength;

                            // if the beams to the left don't allow a "beamlet", draw it in the other direction
                            if (beamCounts[i - 2] <= beamCounts[i] - 1) {
                                xs += 2 * shortBeamLength;
                            }
                        }

                        ctx.drawFatLine(
                            xs,
                            stemEnd(xs, j) + dy,
                            xe,
                            stemEnd(xe, i - 1) + dy,
                            adjustedBeamWidth
                        );

                        // end the beam group
                        j = -1;
                    }
                }
            }
            // TODO: what about multi-direction beams? Then we have to think about the direction
            dy += (-adjustedBeamWidth - adjustedBeamDist) * directions[0];
        }
    }

    constructor() {}
}

// TODO: arbitrary constant
const shortBeamLength = 0.2;

// TODO: arbitrary constants!
const beamWidth = 0.12; //getEngravingDefaults().beamThickness * lineThicknessMul;
const beamDist = 0.03;

export class Note {
    // midi-pitch
    protected pitch: number = 69;
    // list of accidentals to put in front
    protected accidentals: string[] = [];
    // line in system
    protected line: number = 0;

    // duration, i.e. 0,1,2,4,8 ...
    protected duration: number = 4;
    // number of duration-dots
    protected dots: number = 0;

    constructor(note) {
        this.line = note.line;
        this.pitch = note.pitch;
        if (note.accs && note.accs.length > 0) this.accidentals = [note.accs];
        this.duration = note.duration;
        this.dots = note.dots;
    }

    get hasBeams() {
        return this.duration >= 8;
    }

    static drawStem(
        ctx: SVGTarget,
        x: number,
        yl: number,
        w: number,
        stemL: number,
        upwards: boolean
    ) {
        const dx = getEngravingDefaults().stemThickness * lineThicknessMul;
        let w0 = w - dx / 2;
        if (!upwards) {
            w0 = dx / 2;
            stemL = -stemL;
        }
        ctx.drawLine(
            x + w0,
            yl,
            x + w0,
            yl - stemL,
            getEngravingDefaults().stemThickness * lineThicknessMul
        );

        return w0;
    }

    static drawLedgerLines(ctx: SVGTarget, x: number, y: number, l: number, w: number) {
        const le = getEngravingDefaults().legerLineExtension * spatium2points;
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

    static drawAccidentals(ctx: SVGTarget, x: number, yl: number, accidentals: string[]) {
        // TODO: Draw all accidentals. Or should there only be one?
        if (accidentals.length > 0) {
            const w0 = getGlyphWidth(accidentalNames[accidentals[0]]);
            ctx.drawText(x, yl, getSMUFLUni(accidentalNames[accidentals[0]]));
            x += w0 + accsPadding;
        }
        return x;
    }

    static getFlagUni(d: number, upwards: boolean) {
        assert(d <= 1024);
        let uniPoint = parseInt("E240", 16);
        const level = Math.log2(d) - 3;
        uniPoint += level * 2;
        if (!upwards) {
            uniPoint += 1;
        }
        return String.fromCodePoint(uniPoint);
    }

    static drawDots(ctx: SVGTarget, x: number, y: number, w: number, l: number, dots: number) {
        if (dots > 0) {
            // TODO: arbitrary constant
            const dDot = 0.12;
            ctx.drawText(x + w + dDot, y + 0.125 * (l + ((l + 1) % 2)), "\uE1E7 ".repeat(dots));
            x += dDot * dots;
        }
        return x;
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
        const stemL = 1;
        const upwards = l > 3;
        const w0 = Note.drawStem(ctx, x, yl, w, stemL, upwards);

        // flags
        if (duration >= 8) {
            ctx.drawText(
                x + w0,
                yl + stemL * (upwards ? -1 : 1),
                Note.getFlagUni(duration, upwards)
            );
        }
    }

    public draw(ctx: SVGTarget, x: number, y: number, g: BeamGroupContext | null) {
        // TODO: clef specific!
        const clefLine = 45;
        // effective note line
        const l = clefLine - this.line;
        // determine y positions
        const yl = y + 0.125 * l;

        // accidentals
        x = Note.drawAccidentals(ctx, x, yl, this.accidentals);

        // TODO: Support other note-head shapes!
        const noteHead = noteHeads[this.duration <= 2 ? this.duration : "4"];
        const w = getGlyphWidth(noteHead);

        // Ledger lines
        Note.drawLedgerLines(ctx, x, y, l, w);

        // Note head
        ctx.drawText(x, yl, getSMUFLUni(noteHead));

        if (this.duration >= 2) {
            if (g && this.duration >= 8) {
                g.push(x, y, w, this.duration, l, yl);
            } else {
                // Stem
                Note.drawStemWithFlags(ctx, x, yl, l, w, this.duration);
            }
        }

        // Dots
        x = Note.drawDots(ctx, x, y, w, l, this.dots);

        // TODO: arbitrary constant
        return x + w + 0.5;
    }
}
