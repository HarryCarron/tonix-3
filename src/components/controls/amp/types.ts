export interface AmpEnvelope {
  attack: number;
  decay: number;
  sustain: number;
  sustainWidth: number;
  release: number;
}

export interface AmpCurve {
  attackCurve: number;
  decayCurve: number;
  releaseCurve: number;
}

export type ADSR = AmpEnvelope & AmpCurve;

// sustain is a held level, not a timed stage like attack/decay/release - its
// "width" only exists to give its handle a draggable target, so it's capped
// small rather than being able to eat the same timeline space as real stages
export const MAX_SUSTAIN_WIDTH = 0.05;

export const DEFAULT_ADSR: ADSR = {
  attack: 0.1,
  attackCurve: 0,
  decay: 0.2,
  decayCurve: 0,
  sustain: 0.5,
  sustainWidth: MAX_SUSTAIN_WIDTH,
  release: 0.3,
  releaseCurve: 0,
};

export interface ClientPosition {
  clientX: number;
  clientY: number;
}

export interface Handle {
  x: number;
  y: number;
}

// one ADSR stage's interactive geometry: the click-anywhere-to-set panel
// (x, width) and the draggable handle at its end
export interface StageInteraction {
  x: number;
  width: number;
  handle: Handle;
}
