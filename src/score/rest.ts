import { getGlyphAdvance } from "./fonts";
import { SVGTarget } from "./svg";
import { assert } from "./util";


export function drawRest(ctx: SVGTarget, x: number, y: number, note) {
    assert(note.type == "rest", "input must be a rest");

    let uniPoint = parseInt("E4E2", 16);
    assert(note.duration >= 0 && note.duration <= 1024, "rest duration is weird: " + note.duration);
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
    const w = getGlyphAdvance(restName);

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
