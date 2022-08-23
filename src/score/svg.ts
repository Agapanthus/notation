function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

class SVGTarget {
    private s = "";

    constructor() {
        this.s = ' <svg width="100" height="100">';
    }

    finish() {
        return this.s + "</svg>";
    }

    drawLine(x: number, y: number, x2: number, y2: number, stroke: number = 1) {
        this.s += `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" style="stroke:rgb(0,0,0);stroke-width:${stroke}" />`;
    }

    drawText(x:number, y:number, s:string) {
        this.s += `<text x="${x}" y="${y}" fill="black">${htmlEntities(s)}</text>`
    }
}
