import "../backends/svg";
import "../parser/scoreTraverser";
import { Clef, ClefType } from "../objects/clefs";
import { getEngravingDefaults, lineThicknessMul, spatium2points } from "../util/fonts";
import { SVGTarget } from "../backends/svg";
import { Drawable } from "../objects/drawable";
import { Space } from "../objects/space";
import { TimeSignature } from "../objects/timeSignature";
import { MusicFraction } from "../util/musicFraction";
import { BarLine, BarLineType } from "../objects/barline";

export class Stave {
    protected numberOfLines: number = 5;

    // TODO: allow curved staves / changing stave size

    // meaning of the first line
    //protected firstLineTone = 0;

    constructor() {}

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
    }

    static generateInitialHead(content: Drawable[]) {
        return [
            new BarLine(BarLineType.Single),
            new Clef(ClefType.gClef),
            new TimeSignature(new MusicFraction(7, 4)),
            new Space(0.3),
        ];
    }
}
