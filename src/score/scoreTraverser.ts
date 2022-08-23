import { TreeBuffer, Tree, TreeCursor } from "lezer-tree";

export function assert(condition, message: string | null = null) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

export class ScoreTraverser {
    private c: TreeCursor;
    private name: string;
    private s: string;
    private duration: number = 4;
    private durationD: number = 0;
    private octave: number = 4;
    constructor(c: TreeCursor, s: string) {
        this.c = c;
        this.s = s;
        assert(this.n == "InstrumentVoice");
        assert(this.c.next() && this.n == "Identifier");
        this.name = s.slice(c.from, c.to);
        assert(this.c.next() && this.n == "BarList");
        assert(this.c.next());
        console.log("Processing voice:", this.name);
    }

    get cs() {
        return this.s.slice(this.c.from, this.c.to);
    }

    get n() {
        return this.c.name;
    }

    private isDone = false;
    private continue() {
        if (!this.c.next()) {
            this.isDone = true;
            return false;
        }
        return true;
    }

    private newGroup = false;
    next() {
        if (this.isDone || this.n == "InstrumentVoice") return null;

        while (true) {
            if (this.n == "Group") {
                this.newGroup = true;
                assert(this.continue());
            } else if (this.n == "Bar") {
                // pass
                assert(this.continue());
            } else if (this.n == "BarLine") {
                let barLine = this.cs;
                assert(this.continue());
                return { type: "barLine", line: barLine };
            } else {
                break;
            }
        }

        if (this.n == "Tone") {
            assert(this.continue());
            let pitch = 0;
            let line = 0;
            let accs = "";
            if (this.n == "Accidental") {
                const code = {
                    "+": 1,
                    "++": 2,
                    "-": -1,
                    "--": -2,
                    "♭": -1,
                    "♯": 1,
                    "𝄪": 2,
                    "𝄫": -2,
                    "𝄭": -1,
                    "𝄯": 0,
                    "𝄮": 0,
                    "𝄰": 1,
                    "𝄱": 1,
                    "𝄲": 1,
                    "𝄳": -1,
                };
                assert(Object.keys(code).includes(this.cs));
                pitch += code[this.cs];
                accs = ["--", "-", "0", "+", "++"][2 + code[this.cs]];
                this.continue();
            }
            if (this.n == "ToneInOctave") {
                const code = {
                    c: 0,
                    d: 2,
                    e: 4,
                    f: 5,
                    g: 7,
                    a: 9,
                    b: 11,
                    h: 11,
                };
                assert(Object.keys(code).includes(this.cs));
                pitch += code[this.cs];
                const code2 = {
                    c: 0,
                    d: 1,
                    e: 2,
                    f: 3,
                    g: 4,
                    a: 5,
                    b: 6,
                    h: 6,
                };
                line += code2[this.cs];

                this.continue();
            }
            if (this.n == "ToneOctave") {
                if (parseInt(this.cs) + "" == this.cs) {
                    this.octave = parseInt(this.cs);
                    assert(this.octave > -20 && this.octave < 20);
                    this.continue();
                    if (this.n == "Integer") {
                        this.continue();
                    }
                } else if (this.cs[0] == "'") {
                    pitch += 12 * this.cs.length;
                    line += 7 * this.cs.length;
                    this.continue();
                } else if (this.cs[0] == ",") {
                    pitch -= 12 * this.cs.length;
                    line -= 7 * this.cs.length;
                    this.continue();
                } else {
                    assert(false);
                }
            }
            const newGroup = this.newGroup;
            this.newGroup = false;
            return {
                type: "note",
                duration: this.duration,
                dots: this.durationD,
                pitch: this.octave * 12 + pitch,
                newGroup: newGroup,
                line: this.octave * 7 + line,
                accs: accs,
            };
        } else if (this.n == "Duration") {
            this.duration = parseInt(this.cs.slice(1));
            this.durationD = 0;
            assert(this.cs.slice(1).startsWith(this.duration + ""), this.duration + " " + this.cs);
            this.continue();
            if (this.n == "Dots") {
                assert(this.cs[0] == ".");
                this.durationD = this.cs.length; // 1 / ( (1 + Math.pow(2, -this.cs.length)) * 1 / this.duration);
                this.continue();
            }
            return this.next();
        } else if (this.n == "Rest") {
            this.continue();
            return { type: "rest", duration: this.duration, dots: this.durationD };
        } else if (this.n == "SpecificRest") {
            const code = {
                "𝄺": 0,
                "𝄻": 1,
                "𝄼": 2,
                "𝄽": 4,
                "𝄾": 8,
                "𝄿": 16,
                "𝅀": 32,
                "𝅁": 64,
                "𝅂": 128,
            };
            assert(Object.keys(code).includes(this.cs));
            let duration = code[this.cs];
            let durationD = 0;
            this.continue();
            if (this.n == "Dots") {
                assert(this.cs[0] == ".");
                durationD = this.cs.length;
                this.continue();
            }
            return { type: "rest", duration: duration, dots: durationD };
        } else if (this.n == "BlockComment"|| this.n == "Comment") {
            // pass
            this.continue();
        } else {
            assert(false, this.n);
        }
    }
}
