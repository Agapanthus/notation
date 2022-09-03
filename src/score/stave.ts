import "./svg";
import "./scoreTraverser";
import { ClefType, clefType2Line, clefType2unicode } from "./clefs";
import { getEngravingDefaults, getGlyphAdvance, lineThicknessMul, spatium2points } from "./fonts";
import { SVGTarget } from "./svg";

export class Stave {
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

    public draw(can: SVGTarget) {
        // TODO: dynamic width; interact with paginator
        const w = can.width;

        for (let i = 0; i < this.numberOfLines; i++) {
            can.drawLine(
                0,
                i * spatium2points,
                w,
                i * spatium2points,
                getEngravingDefaults().staffLineThickness * lineThicknessMul
            );
        }

        can.drawText(
            Stave.clefDx,
            spatium2points * clefType2Line(this.clef),
            clefType2unicode(this.clef)
        );

        return 0 + (getGlyphAdvance(ClefType[this.clef]) + 2 * Stave.clefDx + Stave.initialDx);
    }
}
