import { getGlyphDim } from "./fonts";
import { MusicFraction } from "./musicFraction";
import { assert, defined } from "./util";

export enum BeatType {
    Note, // note, rest
    Bar, // Barline
    Phantom, // just space, or even completely empty; always synchronized to beats
    Empty, // just space, or even completely empty; never synchronized to beats
}

export interface SystemBeatSpacing {
    width: number;
    ideal: number;
    pre: number;
    // beat: MusicFraction;
    len: number;
    type: BeatType;
    top: number;
    bot: number;
}
export function newEmptySystemBeatSpacing() {
    return {
        width: 0,
        ideal: 0,
        pre: 0,
        len: 0,
        type: BeatType.Phantom,
        top: 0,
        bot: 0,
    };
}

export class SpacedBeat {
    //                   ___
    //        |     ___  _|_ top (direction: up; relative to the first system line)
    //        |      | bot (direction: down; relative to the first system line)
    //    b  O  .   _|_
    //
    // |-| before (recommended)
    //   |--| pre
    //      | = 0
    //   |------| width
    //          |-| after (recommended)
    //            |-----> use-more-space-affinity

    public top: number = 0;
    public bot: number = 0;
    public width: number = 0;

    public aff: number = -1;
    public pre: number = -1;
    public after: number = -1;
    public before: number = -1;

    public type: BeatType;

    // length of the beat; i.e. 3/8. Can be 0/0, which means empty (don't advance beat count)
    public len: MusicFraction; //= new MusicFraction(0, 0);

    get ideal(): number {
        return this.before + this.width + this.after;
    }

    constructor(t: BeatType, len: MusicFraction) {
        this.top = 0;
        this.bot = 0;
        this.width = 0;
        this.aff = 0;
        this.pre = 0;
        this.after = 0;
        this.before = 0;
        this.type = t;
        this.len = len;
    }

    public spaceValidate() {
        assert(this.width >= 0, "width must be initialized");
        assert(this.pre >= 0, "pre must be initialized");
        assert(this.pre <= this.width, "pre <= width", this.pre + " " + this.width);
        assert(this.before >= 0, "before must be initialized");
        assert(this.after >= 0, "after must be initialized");
        assert(this.aff >= 0, "aff must be initialized");
        assert(defined(this.len), "aff must be initialized");
        // top, bot are arbitrary
    }

    public spaceAdd(x: number) {
        assert(x > 0, "must be positive x", x);
        this.width += x;
    }

    public spaceAddPre(x: number) {
        assert(x > 0, "must be positive x", x);
        this.width += x;
        this.pre += x;
    }

    public spaceAddTop(y: number) {
        //assert(y > 0, "must be positive y", y);
        this.top = Math.min(this.top, y);
    }
    public spaceAddBot(y: number) {
        //assert(y > 0, "must be positive y", y);
        this.bot = Math.max(this.bot, y);
    }

    public spaceVerticalPoint(y: number) {
        this.top = Math.min(this.top, y);
        this.bot = Math.max(this.bot, y);
    }

    public spaceAddGlyph(g: string, y: number) {
        const r = getGlyphDim(g);
        const w = Math.abs(r.r - r.l);
        this.width += w;
        this.top = Math.min(this.top, y + r.t);
        this.bot = Math.max(this.bot, y + r.b);
    }

    public spaceAddPreGlyph(g: string, y: number) {
        const w0 = this.width;
        this.spaceAddGlyph(g, y);
        this.pre += this.width - w0;
    }
}
