import { assert } from "./util";
import { Drawable } from "./drawable";
import { BeatType } from "./beat";
import { MusicFraction } from "./musicFraction";
import { getEngravingDefaults, lineThicknessMul, spatium2points } from "./fonts";
import { SVGTarget } from "./svg";

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

// TODO: arbitrary constant
const defaultBarlineSpacing = 0.2;

export class BarLine extends Drawable {
    constructor(private barline: BarLineType) {
        super(BeatType.Bar, new MusicFraction());
    }

    public measure(context): void {
        this.width = this.getWidth();
        this.before = 0;
        this.after = defaultBarlineSpacing;
    }

    static thin = getEngravingDefaults().thinBarlineThickness * lineThicknessMul;
    static thick = getEngravingDefaults().thickBarlineThickness * lineThicknessMul * 1.5; // 1.5 because i like it
    static sep = getEngravingDefaults().barlineSeparation * spatium2points;

    private getWidth(): number {
        if (this.barline == BarLineType.Single) {
            return BarLine.thin;
        } else if (this.barline == BarLineType.Final) {
            return BarLine.thin + BarLine.sep + BarLine.thick;
        } else {
            assert(false, "unknown barline", this.barline);
            return 0;
        }
    }

    private p1(): number {
        return 0 * 0.125;
    }
    private p2(): number {
        return 8 * 0.125;
    }

    public draw(ctx: SVGTarget, x: number, y: number, context) {
        if (this.barline == BarLineType.Single) {
            ctx.drawLine(x, y + this.p1(), x, y + this.p2(), BarLine.thin);
        } else if (this.barline == BarLineType.Final) {
            ctx.drawLine(x, y + this.p1(), x, y + this.p2(), BarLine.thin);
            x += BarLine.sep + BarLine.thin;
            ctx.drawLine(x, y + this.p1(), x, y + this.p2(), BarLine.thick);
        } else if (this.barline == BarLineType.Double) {
            ctx.drawLine(x, y + this.p1(), x, y + this.p2(), BarLine.thin);
            x += BarLine.sep + BarLine.thin;
            ctx.drawLine(x, y + this.p1(), x, y + this.p2(), BarLine.thin);
        } else {
            assert(false, "unknown barline", this.barline);
        }

        //return x + defaultBarlineSpacing * 2;
    }
}
