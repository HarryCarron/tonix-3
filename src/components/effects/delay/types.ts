// feedback/wet are 0-1 knob values; real ranges are derived from these once
// the Tone.js delay is actually wired up. time is a Tone.js Time notation
// string (e.g. "8n") rather than a 0-1 value, chosen from a fixed set of
// note-subdivision stages rather than continuously.
export interface DelayValue {
  time: string;
  feedback: number;
  wet: number;
}
