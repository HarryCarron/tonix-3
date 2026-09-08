// all three are 0-1 knob values; real time/feedback/wet ranges are derived
// from these once the Tone.js delay is actually wired up
export interface DelayValue {
  time: number;
  feedback: number;
  wet: number;
}
