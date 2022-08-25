import { accsPadding } from "./accidental";
import { getEngravingDefaults, getGlyphWidth, lineThicknessMul, spatium2points } from "./fonts";
import { ScoreTraverser } from "./scoreTraverser";
import { SVGTarget } from "./svg";
import { assert, linearRegression } from "./util";

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

export class GroupContext {
    isLast: boolean = false;

    note: { x: number; y: number; w: number; beams: number; l: number }[] = [];

    constructor() {}
}

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

    private drawStem(
        ctx: SVGTarget,
        x: number,
        y: number,
        w: number,
        stemL: number,
        l: number,
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
            y + 0.125 * l,
            x + w0,
            y + 0.125 * l - stemL,
            getEngravingDefaults().stemThickness * lineThicknessMul
        );

        return w0;
    }

    draw(ctx: SVGTarget, x: number, y: number, g: GroupContext | null) {
        // TODO: clef specific!
        const clefLine = 45;
        // effective note line
        const l = clefLine - this.line;

        // accidentials
        if (this.accidentals.length > 0) {
            const code = {
                "++": "\uE263",
                "+": "\uE262",
                "0": "\uE261",
                "-": "\uE260",
                "--": "\uE264",
            };
            const code2 = {
                "++": "accidentalDoubleSharp",
                "+": "accidentalSharp",
                "0": "accidentalNatural",
                "-": "accidentalFlat",
                "--": "accidentalDoubleFlat",
            };
            const w0 = getGlyphWidth(code2[this.accidentals[0]]);

            ctx.drawText(x, y + 0.125 * l, code[this.accidentals[0]]);
            x += w0 + accsPadding;
        }

        let noteHead = "";
        const noteHeads = {
            "0": "noteheadDoubleWhole",
            "1": "noteheadWhole",
            "2": "noteheadHalf",
            "4": "noteheadBlack",
        };
        let noteHeadUni = "";
        const noteHeadUnis = {
            "0": "\uE0A0",
            "1": "\uE0A2",
            "2": "\uE0A3 ",
            "4": "\uE0A4 ",
        };
        if (this.duration <= 2) {
            noteHead = noteHeads[this.duration + ""];
            noteHeadUni = noteHeadUnis[this.duration + ""];
        } else {
            noteHead = noteHeads["4"];
            noteHeadUni = noteHeadUnis["4"];
        }

        const w = getGlyphWidth(noteHead);

        // Ledger lines
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

        // Note head
        ctx.drawText(x, y + 0.125 * l, noteHeadUni);

        // TODO: Create longer stems if there are too many beams / flags
        if (this.duration >= 2) {
            if (g && this.duration >= 8) {
                g.note.push({ x, y: y, w, beams: Math.log2(this.duration) - 2, l: l });
            } else {
                // Stem

                // TODO: automatic stem length
                // TODO: increase stem lengths if there are many ledger lines!
                const stemL = 1;
                const upwards = l > 3;
                const w0 = this.drawStem(ctx, x, y, w, stemL, l, upwards);

                // beams
                if (this.duration >= 8) {
                    assert(this.duration <= 1024);
                    let uniPoint = parseInt("E240", 16);
                    let level = Math.log2(this.duration) - 3;
                    uniPoint += level * 2;
                    if (!upwards) {
                        uniPoint += 1;
                    }
                    ctx.drawText(
                        x + w0,
                        y + 0.125 * l + stemL * (upwards ? -1 : 1),
                        String.fromCodePoint(uniPoint)
                    );
                }
            }

            // Draw beams for everything
            if (g && g.isLast) {
                const gy = g.note.map((c) => c.y + 0.125 * c.l);
                const slope = linearRegression(
                    g.note.map((x) => x.x),
                    gy
                )[1];

                const avgY = gy.reduce((p, c) => p + c) / g.note.length;
                const upwards = avgY > y + 0.125 * 3;
                const dirSign = upwards ? -1 : 1;

                const stemL = 0.9 * dirSign;
                // TODO: increase stemL based on individual notes in the group; i.e., iterate the notes and increase it if a single note is too close
                // TODO: if there are outliers / two vertical groups, place the beam in the middle of the note-heads!
                // TODO: for very long multi-beam (16th) groups, partially interrupt the beams (i.e., every 4 steps). Make this contrallable!
                // TODO: Move beams sp they don't collide with stave lines

                const dx = getEngravingDefaults().stemThickness * lineThicknessMul;
                let gdx = w - dx / 2;
                if (!upwards) gdx = dx / 2;

                const stemEnd = (nx: number) => avgY + stemL + (nx - (g.note[0].x + gdx)) * slope;
                for (const n of g.note) {
                    // ctx.drawText(n.x, stemEnd, "x");
                    this.drawStem(
                        ctx,
                        n.x,
                        n.y,
                        n.w,
                        Math.abs(stemEnd(n.x + gdx) - (n.y + 0.125 * n.l)),
                        n.l,
                        upwards
                    );
                }

                // TODO: arbitrary constants!
                const beamWidth = 0.12; //getEngravingDefaults().beamThickness * lineThicknessMul;
                const beamDist = 0.03;

                let dy = (-beamWidth / 2) * dirSign;
                const x_start = (i: number) => g.note[i].x + gdx - dx / 2;
                const x_end = (i: number) => g.note[i].x + gdx + dx / 2;

                const maxBeams = Math.max(...g.note.map((x) => x.beams));
                const beamCounts = g.note.map((x) => x.beams);
                // append terminator
                beamCounts.push(0);

                // TODO: arbitrary constant
                const shortBeamLength = 0.2;

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
                                    stemEnd(xs) + dy,
                                    xe,
                                    stemEnd(xe) + dy,
                                    beamWidth
                                );

                                // end the beam group
                                j = -1;
                            }
                        }
                    }
                    dy += (-beamWidth - beamDist) * dirSign;
                }
            }
        }

        // Dots
        if (this.dots > 0) {
            // TODO: arbitrary constant
            const dDot = 0.12;
            ctx.drawText(
                x + w + dDot,
                y + 0.125 * (l + ((l + 1) % 2)),
                "\uE1E7 ".repeat(this.dots)
            );
            x += dDot * this.dots;
        }

        // TODO: arbitrary constant
        return x + w + 0.5;
    }
}
