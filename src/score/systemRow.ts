import { sum } from "lodash";
import { BarLine } from "./barline";
import { BeatType } from "./beat";
import { Drawable, NewGroup } from "./drawable";
import { BeamGroupContext, Note } from "./note";
import { Rest } from "./rest";
import { Stave } from "./stave";
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

    private content: Array<Drawable> = [];

    private st: Stave;

    private render(w: number) {
        // use the ideal with as reference
        const referenceSize = w; // sum(beats.map((x) => x.ideal)) * spacingBeatAffinityReferenceSize;
        const lengthBeats = sum(this.content.map((x) => Math.pow(x.len.num, beatLengthExp)));
        const singleBeatWidth = referenceSize / lengthBeats;

        let x = 0;

        // binary search to find a good scale
        // TODO: calculate this directly. Binary search is a hack
        let correction = 1.0;
        for (let i = 1; i < 10; i++) {
            x = 0;
            for (const b of this.content) {
                x += Math.max(
                    correction * singleBeatWidth * Math.pow(b.len.num, beatLengthExp),
                    b.ideal
                );
            }

            // TODO: this should be done in a smarter way using smart spacing...
            if (this.content[this.content.length - 1].type == BeatType.Bar)
                x -= BarLine.removeIdealOnehand();

            if (x > w) correction -= Math.pow(2, -i);
            else if (x < w) correction += Math.pow(2, -i);
            else break;
        }

        // calculate the positions
        x = 0;
        for (let i = 0; i < this.content.length; i++) {
            const b = this.content[i];
            this.positions.push(x);

            // TODO: Replace ideal width with space addition parameters; i.e. it's not just a factor, e.g. a dotted note doesn't want to be treated different from a not-dotted note once the space is large enough to fit the dot anyways, i.e., the dotted note shouldn't get more space than the normal one
            x += Math.max(
                correction * singleBeatWidth * Math.pow(b.len.num, beatLengthExp),
                b.ideal
            );
        }

        assert(this.positions.length == this.content.length);
    }

    constructor(content: Array<Drawable>, w: number) {
        this.content = content;
        this.pres = this.content.map((x) => x.pre);
        this.render(w);

        this.top = Math.min(...this.content.map((x) => x.top));
        this.bot = Math.max(...this.content.map((x) => x.bot));

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

            if (c instanceof NewGroup) {
                if (g) g.drawBeams(ctx);
                g = BeamGroupContext.tryCreate(this.content, i + 1);
            }

            c.draw(ctx, x, y, g);
        }
        if (g) g.drawBeams(ctx);

        assert(this.bot >= 0);
        return y + this.bot;
    }

    public get height() {
        return this.bot - this.top;
    }
}
