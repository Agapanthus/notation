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
