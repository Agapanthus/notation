import { BeatType, SpacedBeat } from "./beat";
import { MusicFraction } from "./musicFraction";
import { BeamGroupContext } from "./note";
import { SVGTarget } from "./svg";

export abstract class Drawable extends SpacedBeat {
    constructor(t: BeatType, len: MusicFraction) {
        super(t, len);
    }

    abstract measure(drawBeams: boolean): void;

    abstract draw(ctx: SVGTarget, x: number, y: number, g: BeamGroupContext | null): void;
}

export class NewGroup extends Drawable {
    constructor() {
        super(BeatType.Empty, new MusicFraction());
    }

    public draw(ctx: SVGTarget, x: number, y: number, g: BeamGroupContext | null) {
        // TODO
    }

    public measure() {
    }
}

