import { TreeBuffer, Tree, TreeCursor } from "lezer-tree";
import { Note } from "../objects/note";
import { assert } from "../util/util";
import { Voice } from "../system/voice";

export class ScoreTraverser {
    private c: TreeCursor;
    private s: string;

    constructor(c: TreeCursor, s: string) {
        this.c = c;
        this.s = s;
        assert(this.n() == "InstrumentVoice");
    }

    public cs() {
        return this.s.slice(this.c.from, this.c.to);
    }

    public n() {
        return this.c.name;
    }

    // user data
    public u: { [key: string]: any };

    private isDone = false;
    public continue() {
        if (!this.c.next()) {
            this.isDone = true;
            return false;
        }
        return true;
    }

    public readAST() {
        const voices: { [s: string]: Voice } = {};
        let currentVoice: string | null = null;

        this.isDone = false;
        while (!this.isDone) {
            // Try to eat a tone off the stream
            if (currentVoice && voices[currentVoice].eatFromAST(this)) {
                continue;
            }

            // everything else
            switch (this.n()) {
                case "InstrumentVoice":
                    this.continue();
                    assert(this.n() == "Identifier");
                    currentVoice = this.cs();
                    if (!(currentVoice in voices)) {
                        voices[currentVoice] = new Voice(currentVoice);
                    }
                    this.continue();

                case "Bar":
                    assert(this.continue());
                    break;

                case "BlockComment":
                case "Comment":
                    // pass
                    this.continue();
                    break;

                default:
                    assert(false, "wrong end", this.n());
            }
        }

        return voices
    }
}
