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