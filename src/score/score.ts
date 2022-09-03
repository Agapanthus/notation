import "./system/stave";
import { ScoreTraverser } from "./parser/scoreTraverser";
import { TreeBuffer, Tree, TreeCursor } from "lezer-tree";
import { SVGTarget } from "./backends/svg";
import { System } from "./system/system";

export function updateScore(c: TreeCursor, s: string) {
    while (c.name != "InstrumentVoice" && c.next());
    const t = new ScoreTraverser(c, s);

    const voices = t.readAST();
    const system = new System(Object.values(voices));
    const w = 10;
    system.render(w);
    const can = new SVGTarget(system.height, w);
    // TODO: should be 0; do spacing in the paginator-class
    can.translate(0, 0.5);
    system.draw(can);

    (document.getElementById("score") as any).innerHTML = can.finish();
}
