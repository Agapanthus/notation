import { BeamGroupContext } from "./beamgroup";
import { Drawable, NewGroup } from "../objects/drawable";
import { SVGTarget } from "../backends/svg";
import { assert } from "../util/util";

export class MusicContext {
    private beamgroup: boolean = false;
    constructor() {}

    public update(content: Drawable[], i: number) {
        if (content[i] instanceof NewGroup) {
            this.beamgroup = BeamGroupContext.shouldCreate(content, i + 1);
        }
    }

    public finish() {}

    get hasBeamgroup(): boolean {
        return this.beamgroup;
    }

    public createDrawingCtx(): DrawingMusicContext {
        return new DrawingMusicContext();
    }

    /*  static copy(ctx: MusicContext) {
        const c2 = new MusicContext();
        c2.beamgroup = ctx.beamgroup ? ctx.beamgroup.copy() : null;
        return c2;
    }*/
}

export class DrawingMusicContext {
    constructor() {}
    private beamgroup: BeamGroupContext | null = null;

    public update(content: Drawable[], i: number, can: SVGTarget) {
        if (content[i] instanceof NewGroup) {
            if (this.beamgroup && can) this.drawBeams(can);
            this.beamgroup = BeamGroupContext.tryCreate(content, i + 1);
        }
    }

    get hasBeamgroup(): boolean {
        return !!this.beamgroup;
    }

    public finish(can: SVGTarget | null) {
        if (this.beamgroup && can) this.drawBeams(can);
    }

    public beamgroupPush(
        x: number,
        y: number,
        w: number,
        duration: number,
        l: number,
        yl: number,
        can: SVGTarget
    ): void {
        assert(this.beamgroup);
        this.beamgroup?.push(x + can.getDx, y + can.getDy, w, duration, l, yl + can.getDy);
    }

    public drawBeams(can: SVGTarget) {
        assert(this.beamgroup);
        can.push();
        can.neutral();
        this.beamgroup?.drawBeams(can);
        can.pop();
    }
}
