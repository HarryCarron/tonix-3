import { describe, expect, it } from "vitest";
import { getCurve } from "./curve";

describe("getCurve", () => {
  it.each([
    [0, "LIN"],
    [1, "EXP"],
    [2, "LOG"],
  ])("maps curve %i to %s", (curve, label) => {
    expect(getCurve(curve)).toBe(label);
  });

  it("falls back to LIN for an unrecognized curve value", () => {
    expect(getCurve(99)).toBe("LIN");
  });
});
