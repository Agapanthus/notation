import { BeatType } from "../util/beat";
import { Drawable } from "./drawable";
import { getGlyphAdvance, getGlyphWidth, getSMUFLUni, spatium2points } from "../util/fonts";
import { DrawingMusicContext, MusicContext } from "../context/musicContext";
import { MusicFraction } from "../util/musicFraction";
import { SVGTarget } from "../backends/svg";

export enum ClefType {
    gClef,
    gClef15mb,
    gClef8vb,
    gClef8va,
    gClef15ma,
    gClef8vbOld,
    gClef8vbCClef,
    gClef8vbParens,
    gClefLigatedNumberBelow,
    gClefLigatedNumberAbove,
    gClefArrowUp,
    gClefArrowDown,
    cClef,
    fClef,
}

export function clefType2unicode(t: ClefType) {
    return getSMUFLUni(ClefType[t]);
}

export function clefType2Line(t: ClefType) {
    switch (t) {
        case ClefType.gClef:
            return 3;
        case ClefType.gClef15mb:
            return 3 - 16;
        case ClefType.gClef8vb:
            return 3 - 8;
        case ClefType.gClef8va:
            return 3 + 8;
        case ClefType.gClef15ma:
            return 3 + 16;
        case ClefType.gClef8vbOld:
            return 3 - 8;
        case ClefType.gClef8vbCClef:
            return 3 - 8;
        case ClefType.gClef8vbParens:
            return 3 - 8;
        case ClefType.gClefLigatedNumberBelow:
            return 3;
        case ClefType.gClefLigatedNumberAbove:
            return 3;
        case ClefType.gClefArrowUp:
            return 3;
        case ClefType.gClefArrowDown:
            return 3;
        case ClefType.cClef:
            return 3; // TODO: c4 in the middle
        case ClefType.fClef:
            return 3; // TODO: f3 in the middle
        default:
            // TODO: more
            console.warn("unknown clef");
            return 3;
    }
}

export class Clef extends Drawable {
    static dx = 0.1;
    constructor(protected clef: ClefType, protected clefLine: number = 0) {
        super(BeatType.Note, new MusicFraction());
    }

    public render(ctx: MusicContext) {
        this.width = getGlyphAdvance(ClefType[this.clef]);
        this.after = Clef.dx;
        //getGlyphAdvance(ClefType[this.clef]);
    }

    public draw(can: SVGTarget, ctx: DrawingMusicContext) {
        can.drawText(0, spatium2points * clefType2Line(this.clef), clefType2unicode(this.clef));
    }
}
