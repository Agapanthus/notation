function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

import _bravura from "../../public/fonts/bravura/bravura_metadata.json"

export const bravura = _bravura;

export class SVGTarget {
    private str = "";
    private s = 50;

    constructor() {
        this.str = ' <svg width="1200" height="300">';
    }

    finish() {
        return this.str + "</svg>";
    }

    drawLine(x: number, y: number, x2: number, y2: number, stroke: number = 1) {
        this.str += `<line x1="${x*this.s}" y1="${y*this.s}" x2="${x2*this.s}" y2="${y2*this.s}" style="stroke:rgb(0,0,0);stroke-width:${this.s * stroke}" />`;
    }

    drawText(x:number, y:number, s:string) {
        this.str += `<text x="${x*this.s}" y="${y*this.s}" font-size="${this.s}px">${htmlEntities(s)}</text>`
    }
}
