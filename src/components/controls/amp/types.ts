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
