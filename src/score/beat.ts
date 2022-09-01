import { Note } from "./note";
import { Rest } from "./rest";
import { BarLine } from "./stave";

export class NewGroup {}

export type VoiceElement = NewGroup | Note | Rest | BarLine;

export enum BeatType {
    Normal,
    Bar,
    Empty
    
}

export interface SystemBeatSpacing {
    width: number;
    ideal: number;
    pre: number;
    // beat: MusicFraction;
    len: number;
    type: BeatType;
    top: number;
    bot: number;
}
export function newEmptySystemBeatSpacing() {
    return {
        width: 0,
        ideal: 0,
        pre: 0,
        len: 0,
        type: BeatType.Empty,
        top: 0,
        bot: 0
    };
}
