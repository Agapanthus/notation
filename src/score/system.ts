import "./svg";
import "./scoreTraverser";
import {ClefType, clefType2Line, clefType2unicode} from "./clefs"
import { getEngravingDefaults, getGlyphAdvance, lineThicknessMul, spatium2points } from "./fonts";
import { SVGTarget } from "./svg";
import { assert } from "./util";


export class System {
    // i.e., 0.5 is half the size. Affects the System and it's content.
    protected relativeSize: number = 1.0;
    protected numberOfLines: number = 5;

    // TODO: allow curved systems / changing system size
    // TODO: allow combined systems (i.e., piano)
    // TODO: allow clef changes

    // clef to draw
    protected clef: ClefType = ClefType.gClef;
    // on which line to place the clef
    protected clefLine = 0;
    // meaning of the first line
    protected firstLineTone = 0;

    // extra
    static clefDx = 0.1;
    static initialDx = 0.3;

    constructor() {}

    draw(ctx: SVGTarget, x: number, y: number) {
        // TODO: dynamic width; interact with paginator
        const w = ctx.width - x - 1;

        for (let i = 0; i < this.numberOfLines; i++) {
            ctx.drawLine(
                x,
                y + i * spatium2points * this.relativeSize,
                x + w,
                y + i * spatium2points * this.relativeSize,
                getEngravingDefaults().staffLineThickness * lineThicknessMul
            );
        }

        ctx.drawText(
            x + System.clefDx * this.relativeSize,
            y + spatium2points * this.relativeSize * clefType2Line(this.clef),
            clefType2unicode(this.clef)
        );

        return (
            x +
            getGlyphAdvance(ClefType[this.clef]) * this.relativeSize +
            2 * System.clefDx * this.relativeSize +
            System.initialDx * this.relativeSize
        );
    }
}


export function drawBarLine(ctx: SVGTarget, x: number, y: number, note) {
    assert(note.type == "barLine");

    assert(note.line == "|");

    // TODO: arbitrary constant
    const dx = 0.4;

    ctx.drawLine(
        x + dx,
        y + 0 * 0.125,
        x + dx,
        y + 8 * 0.125,
        getEngravingDefaults().thinBarlineThickness * lineThicknessMul
    );

    return x + dx * 2;
}