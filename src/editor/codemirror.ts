import { basicSetup } from "codemirror";
import { notation, lezerLinter } from "./lang";
import { parser } from "./notation.js";
import { TreeBuffer, Tree, TreeCursor } from "lezer-tree";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { updateScore } from "../score/score";

function printTree(c: TreeCursor, content: string, indent: number = 0) {
    if (c.name != "SourceFile")
        console.log("   ".repeat(indent) + c.name + " \t" + content.slice(c.from, c.to));
    if (c.firstChild()) {
        printTree(c, content, indent + 1);
        while (c.nextSibling()) printTree(c, content, indent + 1);
        c.parent();
    }
}

function parseDoc(content: string) {
    const tree = parser.parse(content) as Tree;
    const tp = tree.cursor();
    printTree(tp, content);
    updateScore(tp, content);
}

const tabSize = new Compartment();
var view = null as EditorView | null;
export function createEditor(content: string) {
    view = new EditorView({
        extensions: [
            basicSetup,
            notation(),
            EditorView.updateListener.of((v: ViewUpdate) => {
                if (v.docChanged) {
                    parseDoc(v.state.doc.toString());
                }
            }),
            tabSize.of(EditorState.tabSize.of(4)),
            lezerLinter,
        ],
        parent: document.body,
    });
    EditorView.updateListener;

    const update = view.state.update({
        changes: { from: 0, to: view.state.doc.length, insert: content },
    });
    view.update([update]);
}
