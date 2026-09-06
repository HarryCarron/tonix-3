// cumulative X position where each stage ends, shared by the canvas draw
// (drawAmp) and the SVG interaction layer (get) so they can't drift apart
export function computeStageXPositions(
  attack: number,
  decay: number,
  sustainWidth: number,
  release: number,
  xPad: number,
  totalXTravel: number,
): [number, number, number, number] {
  const stages = [attack, decay, sustainWidth, release];

  return stages.map(
    (_, i) =>
      xPad + totalXTravel * stages.slice(0, i + 1).reduce((a, b) => a + b),
  ) as [number, number, number, number];
}
