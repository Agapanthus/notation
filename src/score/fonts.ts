import _bravura, { EngravingDefaults } from "../../public/fonts/bravura/bravura_metadata.json";

export const bravura = _bravura;

import glyphnames from "../../public/fonts/metadata/glyphnames.json";
import { assert } from "./util";

export const lineThicknessMul = 0.25 * 0.5; // half, because i like it
// spatium (sp) = distance between two staff lines
export const spatium2points = 0.25;

const SMUFLUniCache: { [key: string]: string } = {};
export function getSMUFLUni(key: string) {
    if (key in SMUFLUniCache) {
        return SMUFLUniCache[key];
    }
    assert(key in glyphnames, key + " is not a smufl glyph");
    const res = String.fromCodePoint(parseInt(glyphnames[key].codepoint.slice(2), 16));
    SMUFLUniCache[key] = res;
    return res;
}

export interface Rect {
    t: number;
    r: number;
    b: number;
    l: number;
}

export function getEngravingDefaults(font: string = "bravura"): EngravingDefaults {
    assert(font == "bravura", "font must be bravura");
    return bravura.engravingDefaults;
}

const GlyphDimCache: { [font: string]: { [symbol: string]: Rect } } = { bravura: {} };
export function getGlyphDim(glyph: string, font: string = "bravura"): Rect {
    assert(font == "bravura", "font must be bravura");
    if (glyph in GlyphDimCache[font]) {
        return GlyphDimCache[font][glyph];
    }
    assert(glyph in bravura.glyphBBoxes, glyph + " is not part of bravura");
    const t = bravura.glyphBBoxes[glyph];
    const res = { t: t.bBoxNE[1], r: t.bBoxSW[0], b: t.bBoxSW[1], l: t.bBoxNE[0] } as Rect;
    GlyphDimCache[font][glyph] = res;
    return res;
}

export function getGlyphWidth(glyph: string, font: string = "bravura"): number {
    const r = getGlyphDim(glyph, font);
    return Math.abs(r.r - r.l) * spatium2points;
}

export function getGlyphAdvance(glyph: string, font: string = "bravura"): number {
    assert(font == "bravura", "font must be bravura");
    return bravura.glyphAdvanceWidths[glyph] * spatium2points;
}
