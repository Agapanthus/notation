import { accsPadding } from "./accidental";
import { getEngravingDefaults, getGlyphWidth, lineThicknessMul, spatium2points } from "./fonts";
import { ScoreTraverser } from "./scoreTraverser";
import { SVGTarget } from "./svg";
import { assert } from "./util";

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
        assert(note.type == "note");

        this.line = note.line;
        this.pitch = note.pitch;
        if (note.accs && note.accs.length > 0) this.accidentals = [note.accs];
        this.duration = note.duration;
        this.dots = note.dots;
    }

    draw(ctx: SVGTarget, x: number, y: number) {
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

        if (this.duration >= 2) {
            // Stem
            let stemL = -1;
            const dx = getEngravingDefaults().stemThickness * lineThicknessMul;
            let w0 = w - dx / 2;
            let upwards = true;
            if (l <= 3) {
                w0 = dx / 2;
                stemL = -stemL;
                upwards = false;
            }
            ctx.drawLine(
                x + w0,
                y + 0.125 * l,
                x + w0,
                y + 0.125 * l + stemL,
                getEngravingDefaults().stemThickness * lineThicknessMul
            );

            // bars
            if (this.duration >= 8) {
                assert(this.duration <= 1024);
                let uniPoint = parseInt("E240", 16);
                let level = Math.log2(this.duration) - 3;
                uniPoint += level * 2;
                if (!upwards) {
                    uniPoint += 1;
                }
                ctx.drawText(x + w0, y + 0.125 * l + stemL, String.fromCodePoint(uniPoint));
            }

            // TODO: Draw bars!
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
