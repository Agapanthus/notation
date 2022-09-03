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

export function sum(arr: number[]): number {
    let res = 0;
    for (const x of arr) {
        res += x;
    }
    return res;
}

export function eSum(arr: { [key: string]: any }[], el: string): number {
    let res = 0;
    for (const x of arr) {
        res += x[el];
    }
    return res;
}

export function average(arr: number[]): number {
    let res = 0;
    for (const x of arr) {
        res += x;
    }
    return res / arr.length;
}

export function gcd(x: number, y: number): number {
    assert(typeof x === "number" || typeof y === "number");
    x = Math.abs(x);
    y = Math.abs(y);
    while (y) {
        let t = y;
        y = x % y;
        x = t;
    }
    return x;
}

export function defined(x: any): boolean {
    return typeof x !== "undefined";
}

export function last<T>(x: T[]): T {
    return x[x.length - 1];
}
