import { assert, gcd } from "./util";

export class MusicFraction {
    // e.g., "3/4" as metrum or "3/16" as duration of 8th with a dot

    public x: number;
    public y: number;

    get num(): number {
        if (this.x == 0) return this.x;
        assert(this.y != 0);
        return this.x / this.y;
    }

    constructor(x: number | null = null, y: number | null = null) {
        if (x === null) {
            this.x = 0;
            this.y = 0;
        } else {
            assert(
                y && [0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024].includes(y),
                "expected y to be a power of 2",
                y
            );
            if (x !== null) this.x = x;
            if (y !== null) this.y = y;
        }
    }

    static fromDots(duration: number, dots: number): MusicFraction {
        assert(dots >= 0 && Number.isInteger(dots), "expected dots to be an integer", dots);

        let x = 1;
        let y = duration * Math.pow(2, dots);
        if (dots > 0) x += Math.pow(2, dots);
        return new MusicFraction(x, y);
    }

    public simplify(): MusicFraction {
        if (this.x == 0) return this;
        assert(this.y != 0, "y must not be 0");
        const g = gcd(this.x, this.y);
        this.x /= g;
        this.y /= g;
        return this;
    }

    public add(z: MusicFraction): MusicFraction {
        if (z.x == 0) return this;
        if (this.x == 0) {
            this.x = z.x;
            this.y = z.y;
        } else {
            this.x = this.x * z.y + z.x * this.y;
            this.y *= z.y;
        }
        return this;
    }

    public repr(): string {
        if (this.x == 0) return "0/" + this.y;
        const whole = Math.floor(this.x / this.y);
        return whole + " " + (this.x - whole * this.y) + "/" + this.y;
    }

    get isEmpty(): boolean {
        return !(this.x && this.y);
    }
}
