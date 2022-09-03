import { accidentalEffects } from "./accidental";
import { BarLine, barLine2enum } from "./barline";
import { Drawable, NewGroup } from "./drawable";
import { BeamGroupContext, Note, symbolicNoteDurations } from "./note";
import { Rest, restDurations } from "./rest";
import { ScoreTraverser } from "./scoreTraverser";
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
    private octave: number = 5;

    public content: Array<Drawable> = [new NewGroup()];

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
        this.duration = parseInt(t.cs());
        assert(
            t.cs().startsWith(this.duration + ""),
            "wrong duration",
            this.duration + " " + t.cs()
        );
        if (this.duration == 0) this.duration = 0.5;
        if (this.duration == 6) this.duration = 16;
        if (this.duration == 3) this.duration = 32;
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
            if (t.cs()[0] == "'") {
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

        this.content.push(
            new Note({
                duration: this.duration,
                dots: this.durationD,
                pitch: this.octave * 12 + pitch,
                line: this.octave * 7 + line,
                accs: accs,
            })
        );
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

        this.content.push(new Rest({ type: "rest", duration: duration, dots: durationD }));
    }

    public eatFromAST(t: ScoreTraverser): boolean {
        switch (t.n()) {
            case "BarLine":
                let barLine = t.cs();
                t.continue();
                // TODO: different types
                this.content.push(new BarLine(barLine2enum[barLine]));
                return true;

            case "Duration":
                this.parseDuration(t);
                return true;

            case "OctaveSign":
                assert(t.continue());
                assert(t.n() == "Integer");
                assert(parseInt(t.cs()) + "" == t.cs());
                this.octave = parseInt(t.cs());
                assert(this.octave > -20 && this.octave < 20);
                t.continue();
                return true;

            case "DurationSymbolic":
                this.parseDurationSymbolic(t);
                return true;

            case "Group":
                this.content.push(new NewGroup());
                assert(t.continue());
                return true;

            case "Rest":
                t.continue();
                this.content.push(
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

    // render width and so on for every element
    public measure() {
        // TODO:
        // get the width and time-length of every element and map the objects to beats, so you can synchronize multiple voices

        // TODO: adjust top and bottom based on stave itself! (otherwise, things can overlap if notes are only in the upper part etc...)

        let hasG = false;
        for (let i = 0; i < this.content.length; i++) {
            const c = this.content[i];

            if (c instanceof NewGroup) {
                hasG = BeamGroupContext.shouldCreate(this.content, i + 1);
            }
            c.measure(hasG);
        }
    }
}
