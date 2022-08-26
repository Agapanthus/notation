export function assert(condition, message: string | null = null, more: any = null) {
    if (!condition) {
        if (more) throw message + " " + more;
        else if (message) throw message;
        else throw "Assertion failed";
    }
}

export function htmlEntities(str: string): string {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/*b
export function linearRegression(x: number[], y: number[]) {
    const avgX = x.reduce((p, c) => p + c, 0) / x.length;
    const xDifAverage = x.map((x) => avgX - x);
    const SSxx = xDifAverage.map((x) => x ** 2).reduce((p, c) => p + c, 0);
    const avgY = y.reduce((p, c) => p + c, 0) / y.length;
    const yDifAverage = y.map((x) => avgY - x);
    const SSxy = xDifAverage.map((c, i) => c * yDifAverage[i]).reduce((p, c) => p + c, 0);
    const beta = SSxy / SSxx;
    const alpha = avgY - beta * avgX;
    return [alpha, beta];
}
*/

// https://stackoverflow.com/a/19040841/6144727
export function linearRegression(x: number[], y: number[], calcAll: boolean = false) {
    let sumX = 0.0; // sum of x
    let sumXX = 0.0; // sum of x**2
    let sumXY = 0.0; // sum of x * y
    let sumY = 0.0; // sum of y
    let sumYY = 0.0; // sum of y**2
    const n = x.length;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumXX += x[i] * x[i];
        sumXY += x[i] * y[i];
        sumY += y[i];
        sumYY += y[i] * y[i];
    }

    const denom = n * sumXX - sumX * sumX;
    if (denom == 0) {
        // singular matrix. can't solve the problem.
        return null;
    }

    const m = (n * sumXY - sumX * sumY) / denom;
    if (!calcAll) return [m, 0, 0];

    const b = (sumY * sumXX - sumX * sumXY) / denom;

    // compute correlation coeff
    const r =
        (sumXY - (sumX * sumY) / n) /
        Math.sqrt((sumXX - (sumX * sumX) / n) * (sumYY - (sumY * sumY) / n));

    return [m, b, r];
}

export function sum(x: number[]): number {
    return x.reduce((p, c) => p + c);
}

export function average(x: number[]): number {
    return x.reduce((p, c) => p + c) / x.length;
}

export class MusicFraction {
    // e.g., "3/4" as metrum or "3/16" as duration of 8th with a dot

    public x: number;
    public y: number;

    constructor(x: number | null = null, y: number | null = null) {
        if (x === null) {
            this.x = 0;
            this.y = 0;
        } else {
            assert(y && 
                [0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024].includes(y),
                "expected y to be a power of 2",
                y
            );
            if (x !== null) this.x = x;
            if (y !== null) this.y = y;
        }
    }

    static fromDots(duration: number, dots: number) {
        assert(dots >= 0 && Number.isInteger(dots), "expected dots to be an integer", dots);
       
        let x = 1;
        let y = duration * Math.pow(2, dots);
        if (dots > 0) x += Math.pow(2, dots);
        return new MusicFraction(x, y);
    }

    get isEmpty(): boolean {
        return !(this.x && this.y);
    }
}
