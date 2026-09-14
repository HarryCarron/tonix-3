import { describe, expect, it } from "vitest";
import { computeStageXPositions } from "./stage-positions";

describe("computeStageXPositions", () => {
  it("returns cumulative x positions for each ADSR stage", () => {
    const result = computeStageXPositions(0.1, 0.2, 0.05, 0.3, 10, 100);
    expect(result).toEqual([20, 40, 45, 75]);
  });

  it("returns xPad for every stage when all stage widths are 0", () => {
    const result = computeStageXPositions(0, 0, 0, 0, 15, 200);
    expect(result).toEqual([15, 15, 15, 15]);
  });

  it("places the final stage at xPad + totalXTravel when stages sum to 1", () => {
    const result = computeStageXPositions(0.25, 0.25, 0.25, 0.25, 0, 400);
    expect(result[3]).toBe(400);
  });
});
