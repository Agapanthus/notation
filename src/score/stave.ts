import "./svg";
import "./scoreTraverser";
import { ClefType, clefType2Line, clefType2unicode } from "./clefs";
import { getEngravingDefaults, getGlyphAdvance, lineThicknessMul, spatium2points } from "./fonts";
import { SVGTarget } from "./svg";



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

    // TODO: constants
    static clefDx = 0.1;
    static initialDx = 0.3;

    constructor() {}

    static defaultDefaultWidth() {
        return (
            (getGlyphAdvance(ClefType[ClefType.gClef]) + 2 * Stave.clefDx + Stave.initialDx) * 1.0
        );
    }

    public draw(ctx: SVGTarget, x: number, y: number) {
        // TODO: dynamic width; interact with paginator
        const w = ctx.width - x;

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
            (getGlyphAdvance(ClefType[this.clef]) + 2 * Stave.clefDx + Stave.initialDx) *
                this.relativeSize
        );
    }
}
