export interface DelayValue {
  time: string; // Tone.js Time notation, e.g. "8n" — not yet wired to a real Tone.js delay
  feedback: number; // raw 0-1 knob value, not yet mapped to a real range
  wet: number; // raw 0-1 knob value, not yet mapped to a real range
}
