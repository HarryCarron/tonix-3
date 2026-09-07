export interface MidiNoteEvent {
  time: string | number;
  note: string;
  duration: string | number;
  velocity?: number;
}

export type MidiPattern = MidiNoteEvent[];

export const PATTERN_LENGTH = "1m";

export const TEST_PATTERNS: MidiPattern[] = [
  [
    { time: "0:0:0", note: "C4", duration: "8n", velocity: 0.9 },
    { time: "0:1:0", note: "E4", duration: "8n", velocity: 0.9 },
    { time: "0:2:0", note: "G4", duration: "8n", velocity: 0.9 },
    { time: "0:3:0", note: "C5", duration: "8n", velocity: 0.9 },
  ],
  [
    { time: "0:0:0", note: "C5", duration: "16n", velocity: 0.8 },
    { time: "0:0:2", note: "B4", duration: "16n", velocity: 0.8 },
    { time: "0:1:0", note: "A4", duration: "16n", velocity: 0.8 },
    { time: "0:1:2", note: "G4", duration: "16n", velocity: 0.8 },
    { time: "0:2:0", note: "F4", duration: "16n", velocity: 0.8 },
    { time: "0:2:2", note: "E4", duration: "16n", velocity: 0.8 },
    { time: "0:3:0", note: "D4", duration: "16n", velocity: 0.8 },
    { time: "0:3:2", note: "C4", duration: "16n", velocity: 0.8 },
  ],
  [
    { time: "0:0:0", note: "E4", duration: "8n", velocity: 1 },
    { time: "0:0:3", note: "G4", duration: "16n", velocity: 0.7 },
    { time: "0:1:2", note: "A4", duration: "8n", velocity: 0.9 },
    { time: "0:2:0", note: "G4", duration: "8n", velocity: 0.8 },
    { time: "0:3:2", note: "E4", duration: "4n", velocity: 1 },
  ],
  [
    { time: "0:0:0", note: "C4", duration: "8n", velocity: 1 },
    { time: "0:0:0", note: "E4", duration: "8n", velocity: 1 },
    { time: "0:0:0", note: "G4", duration: "8n", velocity: 1 },
    { time: "0:2:0", note: "F4", duration: "8n", velocity: 0.9 },
    { time: "0:2:0", note: "A4", duration: "8n", velocity: 0.9 },
    { time: "0:2:0", note: "C5", duration: "8n", velocity: 0.9 },
  ],
  [
    { time: "0:0:0", note: "D4", duration: "16n", velocity: 0.85 },
    { time: "0:0:2", note: "F4", duration: "16n", velocity: 0.85 },
    { time: "0:1:0", note: "G4", duration: "16n", velocity: 0.85 },
    { time: "0:1:2", note: "F4", duration: "16n", velocity: 0.85 },
    { time: "0:2:0", note: "D4", duration: "16n", velocity: 0.85 },
    { time: "0:2:2", note: "C4", duration: "16n", velocity: 0.85 },
    { time: "0:3:0", note: "D4", duration: "16n", velocity: 0.85 },
    { time: "0:3:2", note: "F4", duration: "16n", velocity: 0.85 },
  ],
];
