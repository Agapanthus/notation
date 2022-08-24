import { accidentalEffects } from "./accidental";
import { GroupContext, Note, symbolicNoteDurations } from "./note";
import { Rest, restDurations } from "./rest";
import { ScoreTraverser } from "./scoreTraverser";
import { BarLine, barLine2enum, BarLineType, Stave } from "./stave";
import { SVGTarget } from "./svg";
import { assert } from "./util";

const inOctavePitch = {
    c: 0,
    d: 2,
    e: 4,
    f: 5,
    g: 7,
    a: 9,
    b: 11,
    h: 11,
};

const inOctaveLine = {
    c: 0,
    d: 1,
    e: 2,
    f: 3,
    g: 4,
    a: 5,
    b: 6,
    h: 6,
};

export class Voice {
    private duration: number = 4;
    private durationD: number = 0;
    private octave: number = 4;
    private newGroup = false;

    private content: Array<Array<Note | Rest | BarLine>> = [];

    constructor(private name: string) {}

    private parseDotsDuration(t: ScoreTraverser) {
        this.durationD = 0;
        if (t.n() == "Dots") {
            assert(t.cs()[0] == ".", "dots don't start with '.'", t.cs());
            this.durationD = t.cs().length; // 1 / ( (1 + Math.pow(2, -this.cs().length)) * 1 / this.duration);
            t.continue();
        }
    }

    private parseDuration(t: ScoreTraverser) {
        this.duration = parseInt(t.cs().slice(1));
        assert(
            t
                .cs()
                .slice(1)
                .startsWith(this.duration + ""),
            "wrong duration",
            this.duration + " " + t.cs()
        );
        t.continue();
        this.parseDotsDuration(t);
    }

    private parseDurationSymbolic(t: ScoreTraverser) {
        assert(t.n() == "DurationSymbolic");
        let n = t.cs().slice(0, 2);
        assert(n in symbolicNoteDurations, "not in symbolic note durations", t.cs());
        this.duration = symbolicNoteDurations[n];
        t.continue();
        this.parseDotsDuration(t);
    }

    private appendContent(content) {
        if (this.content.length == 0 || this.newGroup) {
            this.content.push([]);
        }

        this.content[this.content.length - 1].push(content);
    }

    private parseNote(t: ScoreTraverser) {
        assert(t.n() == "Tone");
        assert(t.continue());
        let pitch = 0;
        let line = 0;
        let accs = "";

        if (t.n() == "Accidental") {
            assert(Object.keys(accidentalEffects).includes(t.cs()));
            pitch += accidentalEffects[t.cs()];
            accs = ["--", "-", "0", "+", "++"][2 + accidentalEffects[t.cs()]];
            t.continue();
        }

        if (t.n() == "ToneInOctave") {
            assert(t.cs() in inOctavePitch);
            pitch += inOctavePitch[t.cs()];
            line += inOctaveLine[t.cs()];
            t.continue();
        }

        if (t.n() == "ToneOctave") {
            if (parseInt(t.cs()) + "" == t.cs()) {
                this.octave = parseInt(t.cs());
                assert(this.octave > -20 && this.octave < 20);
                t.continue();
                if (t.n() == "Integer") {
                    t.continue();
                }
            } else if (t.cs()[0] == "'") {
                pitch += 12 * t.cs().length;
                line += 7 * t.cs().length;
                t.continue();
            } else if (t.cs()[0] == ",") {
                pitch -= 12 * t.cs().length;
                line -= 7 * t.cs().length;
                t.continue();
            } else {
                assert(false, "unexpected tone octave rule");
            }
        }

        // if the note doesn't have bars: interrupt the current group
        // TODO: also make sure there is no group afterwards
        //if (this.duration <= 4) this.newGroup = true;

        this.appendContent(
            new Note({
                duration: this.duration,
                dots: this.durationD,
                pitch: this.octave * 12 + pitch,
                line: this.octave * 7 + line,
                accs: accs,
            })
        );

        this.newGroup = false;
    }

    private parseRest(t: ScoreTraverser) {
        assert(t.cs() in restDurations);
        let duration = restDurations[t.cs()];
        let durationD = 0;
        t.continue();
        if (t.n() == "Dots") {
            assert(t.cs()[0] == ".");
            durationD = t.cs().length;
            t.continue();
        }

        this.appendContent(new Rest({ type: "rest", duration: duration, dots: durationD }));
    }

    public eatFromAST(t: ScoreTraverser): boolean {
        switch (t.n()) {
            case "BarLine":
                let barLine = t.cs();
                assert(t.continue());
                // TODO: different types
                this.appendContent(new BarLine(barLine2enum[barLine]));
                return true;

            case "Duration":
                this.parseDuration(t);
                return true;

            case "DurationSymbolic":
                this.parseDurationSymbolic(t);
                return true;

            case "Group":
                this.newGroup = true;
                assert(t.continue());
                return true;

            case "Rest":
                t.continue();
                this.appendContent(
                    new Rest({ type: "rest", duration: this.duration, dots: this.durationD })
                );
                return true;

            case "SpecificRest":
                this.parseRest(t);
                return true;

            case "Tone":
                this.parseNote(t);
                return true;
        }
        return false;
    }

    public draw(ctx: SVGTarget, x: number, y: number) {
        const st = new Stave();
        x = st.draw(ctx, x, y);

        for (const group of this.content) {
            const hasGroup = group.filter((x) => x instanceof Note && x.hasBeams).length >= 2;

            const g = hasGroup ? new GroupContext() : null;

            let iterations = group.length;
            for (const c of group) {
                if (!--iterations && g) {
                    g.isLast = true;
                    // TODO: Draw groups containing rests / slow notes (e.g., if the last object is a rest)
                }

                if (c instanceof Note) {
                    x = c.draw(ctx, x, y, g);
                } else if (c instanceof Rest) {
                    x = c.draw(ctx, x, y);
                } else if (c instanceof BarLine) {
                    x = c.draw(st, ctx, x, y);
                } else {
                    assert(false, "unknown type", c);
                }
            }
        }

        return y + 3;
    }
}
