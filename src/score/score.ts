import "./stave";
import { ScoreTraverser } from "./scoreTraverser";
import { TreeBuffer, Tree, TreeCursor } from "lezer-tree";
import { SVGTarget } from "./svg";

export function updateScore(c: TreeCursor, s: string) {
    while (c.name != "InstrumentVoice" && c.next());
    const t = new ScoreTraverser(c, s);

    const voices = t.readAST();
    const ctx = new SVGTarget();

    let y = 1
    for (const voice of Object.values(voices)) {
        y = voice.draw(ctx, 1, y);
    }

    (document.getElementById("score") as any).innerHTML = ctx.finish();
}
