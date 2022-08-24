import "./system";
import { ScoreTraverser } from "./scoreTraverser";
import { TreeBuffer, Tree, TreeCursor } from "lezer-tree";
import { SVGTarget } from "./svg";
import { drawBarLine, System } from "./system";
import { Note } from "./note";
import { drawRest } from "./rest";

export function updateScore(c: TreeCursor, s: string) {
    while (c.name != "InstrumentVoice" && c.next());
    const t = new ScoreTraverser(c, s);

    const ctx = new SVGTarget();

    let p = 1;
    const sys = new System();
    p = sys.draw(ctx, p, 1);

    for (let i = 0; i < 30; i++) {
        const note = t.next();

        if (note && note.type == "note") {
            const n = new Note(note);
            p = n.draw(ctx, p, 1);
        }
        if (note && note.type == "rest") {
            p = drawRest(ctx, p, 1, note);
        }
        if (note && note.type == "barLine") {
            p = drawBarLine(ctx, p, 1, note);
        }
    }

    (document.getElementById("score") as any).innerHTML = ctx.finish();
}
