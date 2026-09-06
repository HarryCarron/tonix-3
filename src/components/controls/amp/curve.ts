// attack/decay/release curves cycle through these 3 shapes (see the
// ctx.line/ctx.curve conditional in drawAmp) - curve 0 is a straight
// line, curve 1 pulls the bezier control point toward the segment's end
// value (fast change early, easing toward the target - exponential),
// curve 2 pulls it toward the segment's start value (slow start, fast
// finish - logarithmic)
export function getCurve(curve: number): string {
  switch (curve) {
    case 0:
      return "LIN";
    case 1:
      return "EXP";
    case 2:
      return "LOG";
    default:
      return "LIN";
  }
}
