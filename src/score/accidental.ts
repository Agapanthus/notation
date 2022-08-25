export enum Accidental {
    sharp,
    sharp_double,
    sharp_triple,
    natural,
    flat,
    flat_double,
    flat_triple,
}

export const accsPadding = 0.1; // TODO

export const accidentalEffects = {
    "+": 1,
    "++": 2,
    "-": -1,
    "--": -2,
    "♭": -1,
    "♯": 1,
    "𝄪": 2,
    "𝄫": -2,
    "𝄭": -1,
    "𝄯": 0,
    "𝄮": 0,
    "𝄰": 1,
    "𝄱": 1,
    "𝄲": 1,
    "𝄳": -1,
};

export const accidentalNames = {
    "+": "accidentalSharp",
    "++": "accidentalDoubleSharp",
    "-": "accidentalFlat",
    "--": "accidentalDoubleFlat",
    "♮": "accidentalNatural",
    "♭": "accidentalFlat",
    "♯": "accidentalSharp",
    "𝄪": "accidentalDoubleSharp",
    "𝄫": "accidentalDoubleFlat",
    "𝄭": "accidentalFlatOneArrowDown",
    "𝄯": "accidentalNaturalOneArrowDown",
    "𝄮": "accidentalNaturalOneArrowUp",
    "𝄰": "accidentalThreeQuarterTonesSharpArrowUp",
    "𝄱": "accidentalSharpOneArrowDown",
    "𝄲": "accidentalQuarterToneSharp4",
    "𝄳": "accidentalQuarterToneFlat4",

    "♯♯": "accidentalSharpSharp",
    "+++": "accidentalTripleSharp",
    "---": "accidentalTripleFlat",
    "𝄯♭": "accidentalNaturalFlat",
    "𝄯♯": "accidentalNaturalSharp",
};
