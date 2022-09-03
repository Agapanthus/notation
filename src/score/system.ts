import { BeatType, SystemBeatSpacing } from "./beat";
import { Stave } from "./stave";
import { SVGTarget } from "./svg";
import { SystemRow } from "./systemRow";
import { assert, sum } from "./util";
import { Voice } from "./voice";

// TODO: constant
const interStaveSpace = 0.3;

export class System {
    private rows: SystemRow[] = [];
    private fullHeight: number;
    constructor(private voices: Voice[]) {}
    private rendered = false;

    private appendRow(voice: Voice, from: number, to: number, maxW: number) {
        if (from == to) return;
        assert(from < to);
        this.rows.push(new SystemRow(voice.content.slice(from, to), maxW));
        this.fullHeight += this.rows[this.rows.length - 1].height + interStaveSpace;
    }

    public render(maxWidth: number) {
        this.fullHeight = 0.1; // padding

        // TODO: this should be calculated in a smarter way; i.e., using different types of growable margins for notes
        const maxW = maxWidth - Stave.defaultDefaultWidth();

        assert(this.rows.length == 0, "render must be called at most once");

        for (const voice of Object.values(this.voices)) {
            voice.measure();

            // TODO: measure how much you can fit in a row and break accordingly
            // TODO: Synchronize beats / bars between voices and build systems

            // TODO: measure first stave width in a smarter way than that..
            // best way would probably be to get rid of defaultDefaultWidth etc and append the stave symbols to the content and then render it using the default loop
            let x = Stave.defaultDefaultWidth();
            let lastI = 0;

            let lastBreakableX = 0;
            let lastBreakableI = 0;
            //let lastEmergencyBreakableI = 0;

            for (let i = 0; i < voice.content.length; i++) {
                const b = voice.content[i];
                x += b.ideal;

                if (x > maxWidth) {
                    if (lastI == lastBreakableI) {
                        // TODO: Requires emergency break! (i.e., not at a barline)
                        console.log("emergency break");
                    } else {
                        console.log("break", i, x);
                        assert(lastI < lastBreakableI);
                        this.appendRow(voice, lastI, lastBreakableI, maxW);
                        lastI = lastBreakableI;
                        x -= lastBreakableX;

                        x += Stave.defaultDefaultWidth();
                    }
                }

                if (b.type == BeatType.Bar) {
                    console.log("breakable", i, x);

                    lastBreakableI = i + 1;
                    lastBreakableX = x;
                }
            }

            this.appendRow(voice, lastI, voice.content.length, maxW);
        }

        this.rendered = true;
    }

    public draw(ctx: SVGTarget) {
        assert(this.rendered, "system must be rendered");
        let y = 0.5; // TODO: 0, put margin in page layouter
        for (const row of Object.values(this.rows)) {
            y = row.draw(ctx, 0, y) + interStaveSpace;
        }
    }

    get height() {
        assert(this.rendered, "system must be rendered");
        return this.fullHeight + 0.5; // TODO: + 0
    }
}
