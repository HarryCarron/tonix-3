import { describe, expect, it } from "vitest";
import { describeConnectionPath } from "./connection-path";

describe("describeConnectionPath", () => {
  it("builds an SVG path string starting and ending at the given points", () => {
    const path = describeConnectionPath({ x: 0, y: 0 }, { x: 100, y: 50 });
    expect(path.startsWith("M0,0 ")).toBe(true);
    expect(path.endsWith("100,50")).toBe(true);
  });

  it("produces a straight-through path when from and to share a position", () => {
    const path = describeConnectionPath({ x: 5, y: 5 }, { x: 5, y: 5 });
    expect(path).toBe("M5,5 Q5,5 5,5 Q5,5 5,5");
  });

  it("bows the control points through the horizontal midpoint", () => {
    const from = { x: 0, y: 0 };
    const to = { x: 200, y: 100 };
    const path = describeConnectionPath(from, to);
    // bb.width = from.x - to.x = -200, so control x = to.x + width/2 = 100
    expect(path).toContain("Q100,0");
  });
});
