import { SystemBeatSpacing } from "./beat";
import { SVGTarget } from "./svg";
import { SystemRow } from "./systemRow";
import { assert, sum } from "./util";
import { Voice } from "./voice";

// TODO: constant
const spacingBeatAffinityReferenceSize = 1.0;
const beatLengthExp = 0.5;

export class System {
    private rows: SystemRow[] = [];
    private fullHeight: number;
    constructor(private voices: Voice[]) {}
    private rendered = false;

    public render() {
        this.fullHeight = 0.1; // padding

        for (const voice of Object.values(this.voices)) {
            const beats: SystemBeatSpacing[] = voice.collect();

            // use the ideal with as reference
            const referenceSize = sum(beats.map((x) => x.ideal)) * spacingBeatAffinityReferenceSize;
            const lengthBeats = sum(beats.map((x) => Math.pow(x.len, beatLengthExp)));
            const singleBeatWidth = referenceSize / lengthBeats;

            // TODO: measure how much you can fit in a row and break accordingly
            // TODO: Synchronize beats / bars between voices and build systems

            let x = 0;
            for (let i = 0; i < beats.length; i++) {
                const b = beats[i];
                b.x = x;
                // TODO: Replace ideal width with space addition parameters; i.e. it's not just a factor, e.g. a dotted note doesn't want to be treated different from a not-dotted note once the space is large enough to fit the dot anyways, i.e., the dotted note shouldn't get more space than the normal one
                x += Math.max(
                    singleBeatWidth * (i == 0 ? 0 : Math.pow(b.len, beatLengthExp)),
                    b.ideal
                );
            }

            this.rows.push(new SystemRow(voice.content, beats));
            this.fullHeight += this.rows[this.rows.length - 1].height;
        }

        this.rendered = true;
    }

    public draw(ctx: SVGTarget) {
        assert(this.rendered, "system must be rendered");
        let y = 0;
        for (const row of Object.values(this.rows)) {
            y = row.draw(ctx, 1, y);
        }
    }

    get height() {
        assert(this.rendered, "system must be rendered");
        return this.fullHeight;
    }
}
