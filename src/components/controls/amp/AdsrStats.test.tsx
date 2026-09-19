import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdsrStats } from "./AdsrStats";
import type { ADSR } from "./types";

const amp: ADSR = {
  attack: 0.1,
  attackCurve: 0,
  decay: 0.234,
  decayCurve: 1,
  sustain: 0.5,
  sustainWidth: 0.05,
  release: 0.876,
  releaseCurve: 2,
};

describe("AdsrStats", () => {
  it("renders each stage's value as a rounded percentage", () => {
    render(<AdsrStats amp={amp} />);
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText("23%")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();
  });

  it("renders each stage's curve label", () => {
    render(<AdsrStats amp={amp} />);
    // attack: LIN (0), decay: EXP (1), release: LOG (2)
    expect(screen.getAllByText("LIN")).toHaveLength(2); // attack + sustain (sustainWidth=0.05 -> default LIN)
    expect(screen.getByText("EXP")).toBeInTheDocument();
    expect(screen.getByText("LOG")).toBeInTheDocument();
  });
});
