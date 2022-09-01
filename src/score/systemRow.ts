import { SystemBeatSpacing, VoiceElement } from "./beat";
import { BeamGroupContext, Note } from "./note";
import { Rest } from "./rest";
import { BarLine, Stave } from "./stave";
import { SVGTarget } from "./svg";
import { assert } from "./util";

export class SystemRow {
    private positions: number[] = [];
    private pres: number[] = [];

    private top: number;
    private bot: number;

    private content: Array<Array<VoiceElement>> = [];

    constructor(content: Array<Array<VoiceElement>>, beats: SystemBeatSpacing[]) {
        this.content = content;
        this.pres = beats.map((x) => x.pre);
        this.positions = beats.map((x) => (x.x ? x.x : 0));

        this.top = Math.min(...beats.map((x) => x.top));
        this.bot = Math.max(...beats.map((x) => x.bot));
    }

    public draw(ctx: SVGTarget, x0: number, y: number) {
        assert(this.top <= 0);
        y += -this.top;

        const st = new Stave();
        x0 = st.draw(ctx, x0, y);
        let x = x0;

        let pi = 1;

        for (const group of this.content) {
            const g = BeamGroupContext.tryCreate(group);

            for (const c of group) {
                x = x0 + this.positions[pi] + this.pres[pi];
                pi++;

                if (c instanceof Note) {
                    c.draw(ctx, x, y, g);
                } else if (c instanceof Rest) {
                    c.draw(ctx, x, y);
                } else if (c instanceof BarLine) {
                    c.draw(st, ctx, x, y);
                } else {
                    assert(false, "unknown type", c);
                }
            }

            if (g) g.drawBeams(ctx);
        }

        assert(this.bot >= 0);
        return y + this.bot;
    }

    public get height() {
        return this.bot - this.top;
    }
}
