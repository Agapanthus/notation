import { BeatType, SystemBeatSpacing } from "./beat";
import { DrawingMusicContext, MusicContext } from "./musicContext";
import { Stave } from "./stave";
import { SVGTarget } from "./svg";
import { SystemRow } from "./systemRow";
import { assert } from "./util";
import { Voice } from "./voice";

// TODO: constant
const interStaveSpace = 0.3;

export class System {
    private rows: SystemRow[] = [];
    private fullHeight: number;
    constructor(private voices: Voice[]) {}
    private rendered = false;

    private appendRow(
        voice: Voice,
        from: number,
        to: number,
        maxW: number,
        ctx: DrawingMusicContext
    ) {
        if (from == to) return;
        assert(from < to);
        this.rows.push(new SystemRow(voice.content.slice(from, to), maxW, ctx));
        this.fullHeight += this.rows[this.rows.length - 1].height + interStaveSpace;
    }

    public render(maxWidth: number) {
        this.fullHeight = 0.1; // padding

        // TODO: this should be calculated in a smarter way; i.e., using different types of growable margins for notes
        const maxW = maxWidth - Stave.defaultDefaultWidth();

        assert(this.rows.length == 0, "render must be called at most once");

        for (const voice of Object.values(this.voices)) {
            const ctx = new MusicContext();

            // TODO: render how much you can fit in a row and break accordingly
            // TODO: Synchronize beats / bars between voices and build systems

            // TODO: render first stave width in a smarter way than that..
            // best way would probably be to get rid of defaultDefaultWidth etc and append the stave symbols to the content and then render it using the default loop
            let x = Stave.defaultDefaultWidth();
            let lastI = 0;

            let lastBreakableX = 0;
            let lastBreakableI = 0;
            let lastCtx = ctx.createDrawingCtx();
            //let lastEmergencyBreakableI = 0;

            for (let i = 0; i < voice.content.length; i++) {
                const b = voice.content[i];
                ctx.update(voice.content, i);
                b.render(ctx);

                x += b.ideal;

                if (x > maxWidth) {
                    if (lastI == lastBreakableI) {
                        // TODO: Requires emergency break! (i.e., not at a barline)
                        console.log("emergency break");
                    } else {
                        console.log("break", i, x);
                        assert(lastI < lastBreakableI);
                        this.appendRow(voice, lastI, lastBreakableI, maxW, lastCtx);
                        lastI = lastBreakableI;
                        x -= lastBreakableX;
                        x += Stave.defaultDefaultWidth();
                        lastCtx = ctx.createDrawingCtx();
                    }
                }

                if (b.type == BeatType.Bar) {
                    console.log("breakable", i, x);

                    lastBreakableI = i + 1;
                    lastBreakableX = x;
                }
            }

            ctx.finish();

            this.appendRow(voice, lastI, voice.content.length, maxW, lastCtx);
        }

        this.rendered = true;
    }

    public draw(can: SVGTarget) {
        assert(this.rendered, "system must be rendered");

        // TODO: 0, put margin in page layouter
        can.translate(0, 0.5);
        for (const row of Object.values(this.rows)) {
            row.draw(can);
            can.translate(0, interStaveSpace);
        }
    }

    get height() {
        assert(this.rendered, "system must be rendered");
        return this.fullHeight + 0.5; // TODO: + 0
    }
}
