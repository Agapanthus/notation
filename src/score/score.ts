import "./stave";
import { ScoreTraverser } from "./scoreTraverser";
import { TreeBuffer, Tree, TreeCursor } from "lezer-tree";
import { SVGTarget } from "./svg";

export function updateScore(c: TreeCursor, s: string) {
    while (c.name != "InstrumentVoice" && c.next());
    const t = new ScoreTraverser(c, s);

    const voices = t.readAST();
    let fullHeight = 0.1 // padding
    for (const voice of Object.values(voices)) {
        voice.render();
        fullHeight += voice.height
    }

    const ctx = new SVGTarget(fullHeight);

    let y = 0;
    for (const voice of Object.values(voices)) {
        y = voice.draw(ctx, 1, y);
    }

    (document.getElementById("score") as any).innerHTML = ctx.finish();
}
