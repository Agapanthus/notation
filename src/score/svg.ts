import { htmlEntities } from "./util";

export class SVGTarget {
    private str = "";
    private s = 50;

    public width: number = 1200;
    public height: number = 300;

    constructor() {
        this.str = `<svg width="${this.width}" height="${this.height}">`;
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
}
