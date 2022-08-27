import { htmlEntities } from "./util";

export class SVGTarget {
    private str = "";
    public width: number = 1200;
    public height: number = 300;

    constructor(fullHeight: number, private s: number = 50) {
        this.str = `<svg width="${this.width}" height="${this.s * fullHeight}">`;
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
}
