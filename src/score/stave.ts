import "./svg";
import "./scoreTraverser";
import { ClefType, clefType2Line, clefType2unicode } from "./clefs";
import { getEngravingDefaults, getGlyphAdvance, lineThicknessMul, spatium2points } from "./fonts";
import { SVGTarget } from "./svg";
import { assert } from "./util";

export enum BarLineType {
    // https://w3c.github.io/smufl/latest/tables/barlines.html
    // Scoring programs should draw their own barlines using primitives, not use the glyphs in this range.

    Single,
    Double,
    Final,
    ReverseFinal,
    Heavy,
    HeavyHeavy,
    Dashed,
    Dotted,
    Short,
    Tick,
    RepeatOpen,
    RepeatClose,
}

export const barLine2enum = {
    "|": BarLineType.Single,
    "|:": BarLineType.RepeatOpen,
    ":|": BarLineType.RepeatClose,
    "||": BarLineType.Double,
    "𝄀": BarLineType.Single,
    "𝄁": BarLineType.Double,
    "𝄂": BarLineType.Final,
    "𝄃": BarLineType.ReverseFinal,
    "𝄄": BarLineType.Dashed,
    "𝄅": BarLineType.Tick,
    "𝄆": BarLineType.RepeatOpen,
    "𝄇": BarLineType.RepeatClose,
};

export class BarLine {
    constructor(private barline: BarLineType) {}

    draw(s: Stave, ctx: SVGTarget, x: number, y: number) {
        // TODO: arbitrary constant
        const dx = 0.4;

        if (this.barline == BarLineType.Single) {
            ctx.drawLine(
                x + dx,
                y + 0 * 0.125,
                x + dx,
                y + 8 * 0.125,
                getEngravingDefaults().thinBarlineThickness * lineThicknessMul
            );
        } else if (this.barline == BarLineType.Final) {
            ctx.drawLine(
                x + dx,
                y + 0 * 0.125,
                x + dx,
                y + 8 * 0.125,
                getEngravingDefaults().thinBarlineThickness * lineThicknessMul
            );
            ctx.drawLine(
                x + dx + getEngravingDefaults().barlineSeparation * spatium2points,
                y + 0 * 0.125,
                x + dx + getEngravingDefaults().barlineSeparation * spatium2points,
                y + 8 * 0.125,
                getEngravingDefaults().thickBarlineThickness * lineThicknessMul
            );
        } else {
            assert(false, "unknown barline", this.barline);
        }

        return x + dx * 2;
    }
}

export class Stave {
    // i.e., 0.5 is half the size. Affects the stave and it's content.
    protected relativeSize: number = 1.0;
    protected numberOfLines: number = 5;

    // TODO: allow curved staves / changing stave size
    // TODO: allow combined staves (i.e., piano)
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
            x + Stave.clefDx * this.relativeSize,
            y + spatium2points * this.relativeSize * clefType2Line(this.clef),
            clefType2unicode(this.clef)
        );

        return (
            x +
            getGlyphAdvance(ClefType[this.clef]) * this.relativeSize +
            2 * Stave.clefDx * this.relativeSize +
            Stave.initialDx * this.relativeSize
        );
    }
}
