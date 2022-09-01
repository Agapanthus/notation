import "./stave";
import { ScoreTraverser } from "./scoreTraverser";
import { TreeBuffer, Tree, TreeCursor } from "lezer-tree";
import { SVGTarget } from "./svg";
import { System } from "./system";

export function updateScore(c: TreeCursor, s: string) {
    while (c.name != "InstrumentVoice" && c.next());
    const t = new ScoreTraverser(c, s);

    const voices = t.readAST();
    const system = new System(Object.values(voices));
    system.render();
    const ctx = new SVGTarget(system.height);
    system.draw(ctx);

    (document.getElementById("score") as any).innerHTML = ctx.finish();
}
