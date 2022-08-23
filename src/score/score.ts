import "./system";
import { assert, ScoreTraverser } from "./scoreTraverser";
import { TreeBuffer, Tree, TreeCursor } from "lezer-tree";
import { SVGTarget, bravura } from "./svg";

const lineThicknessMul = 0.25 * 0.5; // half, because i like it
const staffspace2points = 0.25;
const accsPadding = 0.1; // TODO

function drawSystem(ctx: SVGTarget, x: number, y: number) {
    const w = 1250;
    for (let i = 0; i < 5; i++) {
        ctx.drawLine(
            x,
            y + i * staffspace2points,
            x + w,
            y + i * staffspace2points,
            bravura.engravingDefaults.staffLineThickness * lineThicknessMul
        );
    }

    ctx.drawText(x, y + staffspace2points * 3, "\uE050");
}

function drawNote(ctx: SVGTarget, x: number, y: number, note) {
    // TODO: clef specific!
    const clefLine = 45;
    // effective note line
    const l = clefLine - note.line;

    assert(note.type == "note");

    // accidentials
    if (note.accs != "") {
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
        const w0 =
            (bravura.glyphBBoxes[code2[note.accs]].bBoxNE[0] -
                bravura.glyphBBoxes[code2[note.accs]].bBoxSW[0]) *
            staffspace2points;

        ctx.drawText(x, y + 0.125 * l, code[note.accs]);
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
    if (note.duration <= 2) {
        noteHead = noteHeads[note.duration + ""];
        noteHeadUni = noteHeadUnis[note.duration + ""];
    } else {
        noteHead = noteHeads["4"];
        noteHeadUni = noteHeadUnis["4"];
    }

    const w =
        (bravura.glyphBBoxes[noteHead].bBoxNE[0] - bravura.glyphBBoxes[noteHead].bBoxSW[0]) *
        staffspace2points;

    // Ledger lines
    const le = bravura.engravingDefaults.legerLineExtension * staffspace2points;
    if (l <= -2) {
        for (let i = -2; i >= l; i -= 2) {
            ctx.drawLine(
                x - le / 2,
                y + i * 0.125,
                x + w + le / 2,
                y + i * 0.125,
                bravura.engravingDefaults.legerLineThickness * lineThicknessMul
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
                bravura.engravingDefaults.legerLineThickness * lineThicknessMul
            );
        }
    }

    // Note head
    ctx.drawText(x, y + 0.125 * l, noteHeadUni);

    if (note.duration >= 2) {
        // Stem
        let stemL = -1;
        const dx = bravura.engravingDefaults.stemThickness * lineThicknessMul;
        let w0 = w - dx;
        let upwards = true;
        if (l <= 3) {
            w0 = dx;
            stemL = -stemL;
            upwards = false;
        }
        ctx.drawLine(
            x + w0,
            y + 0.125 * l,
            x + w0,
            y + 0.125 * l + stemL,
            bravura.engravingDefaults.stemThickness * lineThicknessMul
        );

        // bars
        if (note.duration >= 8) {
            assert(note.duration <= 1024);
            let uniPoint = parseInt("E240", 16);
            let level = Math.log2(note.duration) - 3;
            uniPoint += level * 2;
            if (!upwards) {
                uniPoint += 1;
            }
            ctx.drawText(x + w0, y + 0.125 * l + stemL, String.fromCodePoint(uniPoint));
        }

        // TODO: Draw bars!
    }

    // Dots
    if (note.dots > 0) {
        // TODO: arbitrary constant
        const dDot = 0.12;
        ctx.drawText(x + w + dDot, y + 0.125 * (l + ((l + 1) % 2)), "\uE1E7 ".repeat(note.dots));
        x += dDot * note.dots;
    }

    // TODO: arbitrary constant
    return x + w + 0.5;
}

function drawRest(ctx: SVGTarget, x: number, y: number, note) {
    assert(note.type == "rest");

    let uniPoint = parseInt("E4E2", 16);
    assert(note.duration >= 0 && note.duration <= 1024);
    const restName =
        "rest" +
        {
            "0": "DoubleWhole",
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
        }[note.duration + ""];
    if (note.duration > 0) uniPoint += 1 + Math.log2(note.duration);
    const w =
        (bravura.glyphBBoxes[restName].bBoxNE[0] - bravura.glyphBBoxes[restName].bBoxSW[0]) *
        staffspace2points;

    ctx.drawText(x, y + 0.125 * 4, String.fromCodePoint(uniPoint));

    // Dots
    if (note.dots > 0) {
        // TODO: arbitrary constant
        const dDot = 0.12;
        ctx.drawText(x + w + dDot, y + 0.125 * 5, "\uE1E7 ".repeat(note.dots));
        x += dDot * note.dots;
    }

    // TODO: arbitrary constant
    return x + w + 0.2;
}

function drawBarLine(ctx: SVGTarget, x: number, y: number, note) {
    assert(note.type == "barLine");

    assert(note.line == "|");

    // TODO: arbitrary constant
    const dx = 0.4;

    ctx.drawLine(
        x + dx,
        y + 0 * 0.125,
        x + dx,
        y + 8 * 0.125,
        bravura.engravingDefaults.thinBarlineThickness * lineThicknessMul
    );

    return x + dx * 2;
}

export function updateScore(c: TreeCursor, s: string) {
    while (c.name != "InstrumentVoice" && c.next());
    const t = new ScoreTraverser(c, s);

    const ctx = new SVGTarget();

    drawSystem(ctx, 1, 1);

    let p = 2;
    for (let i = 0; i < 30; i++) {
        const note = t.next();

        if (note && note.type == "note") {
            p = drawNote(ctx, p, 1, note);
        }
        if (note && note.type == "rest") {
            p = drawRest(ctx, p, 1, note);
        }
        if (note && note.type == "barLine") {
            p = drawBarLine(ctx, p, 1, note);
        }
    }

    (document.getElementById("score") as any).innerHTML = ctx.finish();
}
