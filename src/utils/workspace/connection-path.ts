export interface Point {
  x: number;
  y: number;
}

/**
 * SVG path `d` for a patch cable between two content-space points: a pair of
 * quadratic curves that bow through the horizontal midpoint between them.
 * Ported from tonix-2-react's Connections component (`prepare()`).
 */
export function describeConnectionPath(from: Point, to: Point): string {
  const bb = {
    height: from.y - to.y,
    width: from.x - to.x,
  };

  return [
    `M${from.x},${from.y} `,
    `Q${to.x + bb.width / 2},${from.y} `,
    `${to.x + bb.width / 2},${to.y + bb.height / 2} `,
    `Q${to.x + bb.width / 2},${from.y - bb.height} `,
    `${to.x},${to.y}`,
  ].join("");
}
