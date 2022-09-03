import { BeamGroupContext } from "./beamgroup";
import { Drawable, NewGroup } from "./drawable";
import { SVGTarget } from "./svg";
import { assert } from "./util";

export class MusicContext {
    private beamgroup: BeamGroupContext | null = null;
    constructor() {}

    public update(content: Drawable[], i: number, can: SVGTarget | null) {
        if (content[i] instanceof NewGroup) {
            if (this.beamgroup && can) this.drawBeams(can);
            this.beamgroup = BeamGroupContext.tryCreate(content, i + 1);
        }
    }

    public finish(can: SVGTarget | null) {
        if (this.beamgroup && can) this.drawBeams(can);
    }

    get hasBeamgroup(): boolean {
        return !!this.beamgroup;
    }

    public beamgroupPush(
        x: number,
        y: number,
        w: number,
        duration: number,
        l: number,
        yl: number
    ): void {
        assert(this.beamgroup);
        this.beamgroup?.push(x, y, w, duration, l, yl);
    }

    public drawBeams(can: SVGTarget) {
        assert(this.beamgroup);
        this.beamgroup?.drawBeams(can);
    }

    static copy(ctx: MusicContext) {
        const c2 = new MusicContext();
        c2.beamgroup = ctx.beamgroup ? ctx.beamgroup.copy() : null;
        return c2;
    }
}
