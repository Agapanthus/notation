import { BeatType } from "./beat";
import { Drawable } from "./drawable";
import { DrawingMusicContext, MusicContext } from "./musicContext";
import { Stave } from "./stave";
import { SVGTarget } from "./svg";
import { SystemRow } from "./systemRow";
import { assert, last } from "./util";
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
        prepend: Drawable[],
        from: number,
        to: number,
        maxW: number,
        ctx: DrawingMusicContext
    ) {
        if (from == to) return;
        assert(from < to);
        this.rows.push(new SystemRow(prepend.concat(voice.content.slice(from, to)), maxW, ctx));
        this.fullHeight += last(this.rows).height + interStaveSpace;
    }

    static quickRender(arr: Drawable[]) {
        const ctx = new MusicContext();
        let x = 0;
        let i = -1;
        while (++i < arr.length) {
            const b = arr[i];
            ctx.update(arr, i);
            b.render(ctx);

            x += b.ideal;
        }
        return x;
    }

    public render(maxWidth: number) {
        this.fullHeight = 0.1; // padding

        assert(this.rows.length == 0, "render must be called at most once");

        for (const voice of Object.values(this.voices)) {
            const ctx = new MusicContext();

            // TODO: render how much you can fit in a row and break accordingly
            // TODO: Synchronize beats / bars between voices and build systems

            // TODO: render first stave width in a smarter way than that..
            // best way would probably be to get rid of defaultDefaultWidth etc and append the stave symbols to the content and then render it using the default loop

            let prepend: Drawable[] = Stave.generateInitialHead(voice.content);
            let x = System.quickRender(prepend);
            let lastI = 0;

            let lastBreakableX = 0;
            let lastBreakableI = 0;
            let lastCtx = ctx.createDrawingCtx();
            //let lastEmergencyBreakableI = 0;

            let i = -1;
            while (++i < voice.content.length) {
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
                        this.appendRow(voice, prepend, lastI, lastBreakableI, maxWidth, lastCtx);
                        lastI = lastBreakableI;
                        x -= lastBreakableX;
                        prepend = last(this.rows).generateNextHead();
                        x += System.quickRender(prepend);
                        //x += Stave.defaultDefaultWidth();
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

            this.appendRow(voice, prepend, lastI, voice.content.length, maxWidth, lastCtx);
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
