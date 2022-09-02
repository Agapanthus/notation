export interface EngravingDefaults {
    arrowShaftThickness: number;
    barlineSeparation: number;
    beamSpacing: number;
    beamThickness: number;
    bracketThickness: number;
    dashedBarlineDashLength: number;
    dashedBarlineGapLength: number;
    dashedBarlineThickness: number;
    hBarThickness: number;
    hairpinThickness: number;
    legerLineExtension: number;
    legerLineThickness: number;
    lyricLineThickness: number;
    octaveLineThickness: number;
    pedalLineThickness: number;
    repeatBarlineDotSeparation: number;
    repeatEndingLineThickness: number;
    slurEndpointThickness: number;
    slurMidpointThickness: number;
    staffLineThickness: number;
    stemThickness: number;
    subBracketThickness: number;
    textEnclosureThickness: number;
    textFontFamily: string[];
    thickBarlineThickness: number;
    thinBarlineThickness: number;
    tieEndpointThickness: number;
    tieMidpointThickness: number;
    tupletBracketThickness: number;
}

declare const bravura: {
    fontName: string;
    fontVersion: number;
    engravingDefaults: EngravingDefaults;
    glyphAdvanceWidths: { [key: string]: number };
    glyphBBoxes: { [key: string]: { bBoxNE: number[]; bBoxSW: number[] } };
    glyphsWithAlternates: { [key: string]: { alternates: { codepoint: string; name: string }[] } };
    glyphsWithAnchors: { [key: string]: { [key: string]: number[] } };
    ligatures: {
        [key: string]: { codepoint: string; componentGlyphs: string[]; description: string };
    };
    optionalGlyphs: {
        [key: string]: {
            classes: string[];
            codepoint: string;
            description: string;
        };
    };
    sets: {
        [key: string]: {
            description: string;
            glyphs: {
                alternateFor: string;
                codepoint: string;
                name: string;
                description: string;
            }[];
        };
    };
};
export default bravura;
