import { sum } from "lodash";
import { BeatType, NewGroup, SystemBeatSpacing, VoiceElement } from "./beat";
import { BeamGroupContext, Note } from "./note";
import { Rest } from "./rest";
import { BarLine, Stave } from "./stave";
import { SVGTarget } from "./svg";
import { assert } from "./util";

// TODO: constant
const spacingBeatAffinityReferenceSize = 1.0;
const beatLengthExp = 0.6;

export class SystemRow {
    private positions: number[] = [];
    private pres: number[] = [];

    private top: number;
    private bot: number;

    private content: Array<VoiceElement> = [];

    private st: Stave;

    private render(beats: SystemBeatSpacing[], w: number) {
        // use the ideal with as reference
        const referenceSize = w; // sum(beats.map((x) => x.ideal)) * spacingBeatAffinityReferenceSize;
        const lengthBeats = sum(beats.map((x) => Math.pow(x.len, beatLengthExp)));
        const singleBeatWidth = referenceSize / lengthBeats;

        let x = 0;

        // binary search to find a good scale
        // TODO: calculate this directly. Binary search is a hack
        let correction = 1.0;
        for (let i = 1; i < 10; i++) {
            x = 0;
            for (const b of beats) {
                x += Math.max(
                    correction * singleBeatWidth * Math.pow(b.len, beatLengthExp),
                    b.ideal
                );
            }

            // TODO: this should be done in a smarter way using smart spacing...
            if (beats[beats.length - 1].type == BeatType.Bar) x -= BarLine.removeIdealOnehand();

            if (x > w) correction -= Math.pow(2, -i);
            else if (x < w) correction += Math.pow(2, -i);
            else break;
        }

        // calculate the positions 
        x = 0;
        for (let i = 0; i < beats.length; i++) {
            const b = beats[i];
            this.positions.push(x);

            // TODO: Replace ideal width with space addition parameters; i.e. it's not just a factor, e.g. a dotted note doesn't want to be treated different from a not-dotted note once the space is large enough to fit the dot anyways, i.e., the dotted note shouldn't get more space than the normal one
            x += Math.max(correction * singleBeatWidth * Math.pow(b.len, beatLengthExp), b.ideal);
        }

        assert(this.positions.length == beats.length);
    }

    constructor(content: Array<VoiceElement>, beats: SystemBeatSpacing[], w: number) {
        this.content = content;
        this.pres = beats.map((x) => x.pre);
        this.render(beats, w);

        this.top = Math.min(...beats.map((x) => x.top));
        this.bot = Math.max(...beats.map((x) => x.bot));

        this.st = new Stave();
    }

    public draw(ctx: SVGTarget, x0: number, y: number) {
        assert(this.top <= 0);
        y += -this.top;

        x0 = this.st.draw(ctx, x0, y);
        let x = x0;

        let g: BeamGroupContext | null = null;
        for (let i = 0; i < this.content.length; i++) {
            x = x0 + this.positions[i] + this.pres[i];
            const c = this.content[i];

            if (c instanceof Note) {
                c.draw(ctx, x, y, g);
            } else if (c instanceof Rest) {
                c.draw(ctx, x, y);
            } else if (c instanceof BarLine) {
                c.draw(this.st, ctx, x, y);
            } else if (c instanceof NewGroup) {
                if (g) g.drawBeams(ctx);
                g = BeamGroupContext.tryCreate(this.content, i + 1);
            } else {
                assert(false, "unknown type", c);
            }
        }
        if (g) g.drawBeams(ctx);

        assert(this.bot >= 0);
        return y + this.bot;
    }

    public get height() {
        return this.bot - this.top;
    }
}
