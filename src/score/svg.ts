import { htmlEntities } from "./util";

export class SVGTarget {
    private str = "";
    private dx: number = 0;
    private dy: number = 0;

    constructor(public height: number, public width: number, private s: number = 50) {
        // To see whether there is stuff beyond the borders
        const extra = 100;
        this.str = `<svg width="${this.s * this.width + extra}" height="${this.s * height}">`;
    }

    finish() {
        return this.str + "</svg>";
    }

    drawLine(x: number, y: number, x2: number, y2: number, stroke: number = 1) {
        x = (x + this.dx) * this.s;
        y = (y + this.dy) * this.s;
        x2 = (x2 + this.dx) * this.s;
        y2 = (y2 + this.dy) * this.s;
        this.str += `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" style="stroke:rgb(0,0,0);stroke-width:${
            this.s * stroke
        }" />`;
    }

    drawText(x: number, y: number, s: string) {
        x = (x + this.dx) * this.s;
        y = (y + this.dy) * this.s;
        this.str += `<text x="${x}" y="${y}" font-size="${this.s}px">${htmlEntities(s)}</text>`;
    }

    drawFatLine(x1: number, y1: number, x2: number, y2: number, s: number = 1) {
        x1 = (x1 + this.dx) * this.s;
        y1 = (y1 + this.dy) * this.s;
        s = (s / 2) * this.s;
        x2 = (x2 + this.dx) * this.s;
        y2 = (y2 + this.dy) * this.s;
        this.str += `<polygon points="
            ${x1},${y1 + s} 
            ${x2},${y2 + s} 
            ${x2},${y2 - s} 
            ${x1},${y1 - s}"  />`;
    }

    public get getDx(): number {
        return this.dx;
    }
    public get getDy(): number {
        return this.dy;
    }

    translate(dx: number, dy: number) {
        this.dx += dx;
        this.dy += dy;
    }

    neutral() {
        this.dx = 0;
        this.dy = 0;
    }

    private stack: number[] = [];
    public push() {
        this.stack.push(this.dx);
        this.stack.push(this.dy);
    }
    pop() {
        this.dy = this.stack.pop() ?? 0;
        this.dx = this.stack.pop() ?? 0;
    }
}
