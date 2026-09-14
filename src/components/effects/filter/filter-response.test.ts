import { describe, expect, it } from "vitest";
import {
  DB_MAX,
  DB_MIN,
  FREQ_AXIS_TICKS,
  FREQ_MAX,
  FREQ_MIN,
  hzToNorm,
  normToHz,
  normToQ,
} from "./filter-response";

describe("normToHz / hzToNorm", () => {
  it("maps the normalized range endpoints to FREQ_MIN/FREQ_MAX", () => {
    expect(normToHz(0)).toBeCloseTo(FREQ_MIN);
    expect(normToHz(1)).toBeCloseTo(FREQ_MAX);
  });

  it("is the inverse of hzToNorm", () => {
    for (const norm of [0, 0.25, 0.5, 0.75, 1]) {
      expect(hzToNorm(normToHz(norm))).toBeCloseTo(norm, 10);
    }
  });

  it("maps FREQ_MIN/FREQ_MAX back to 0/1", () => {
    expect(hzToNorm(FREQ_MIN)).toBeCloseTo(0);
    expect(hzToNorm(FREQ_MAX)).toBeCloseTo(1);
  });
});

describe("normToQ", () => {
  it("maps the normalized range endpoints to the resonance range", () => {
    expect(normToQ(0)).toBeCloseTo(0.1);
    expect(normToQ(1)).toBeCloseTo(20);
  });
});

describe("plot constants", () => {
  it("keeps DB_MIN below DB_MAX", () => {
    expect(DB_MIN).toBeLessThan(DB_MAX);
  });

  it("has 4 evenly log-spaced axis ticks spanning FREQ_MIN to FREQ_MAX", () => {
    expect(FREQ_AXIS_TICKS).toHaveLength(4);
    expect(FREQ_AXIS_TICKS[0].hz).toBe(FREQ_MIN);
    expect(FREQ_AXIS_TICKS[FREQ_AXIS_TICKS.length - 1].hz).toBe(FREQ_MAX);
  });
});
