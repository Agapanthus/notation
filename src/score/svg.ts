import { htmlEntities } from "./util";

export class SVGTarget {
    private str = "";

    constructor(public height: number, public width: number, private s: number = 50) {
        // To see whether there is stuff beyond the borders
        const extra = 100
        this.str = `<svg width="${this.s * this.width + extra}" height="${this.s * height}">`;
    }

    finish() {
        return this.str + "</svg>";
    }

    drawLine(x: number, y: number, x2: number, y2: number, stroke: number = 1) {
        this.str += `<line x1="${x * this.s}" y1="${y * this.s}" x2="${x2 * this.s}" y2="${
            y2 * this.s
        }" style="stroke:rgb(0,0,0);stroke-width:${this.s * stroke}" />`;
    }

    drawText(x: number, y: number, s: string) {
        this.str += `<text x="${x * this.s}" y="${y * this.s}" font-size="${
            this.s
        }px">${htmlEntities(s)}</text>`;
    }

    drawFatLine(x: number, y: number, x2: number, y2: number, s: number = 1) {
        this.str += `<polygon points="${x * this.s},${(y + s / 2) * this.s} ${x2 * this.s},${
            (y2 + s / 2) * this.s
        } ${x2 * this.s},${(y2 - s / 2) * this.s} ${x * this.s},${(y - s / 2) * this.s}"  />`;
    }

    translate(x:number, y:number) {
        
    }
}
