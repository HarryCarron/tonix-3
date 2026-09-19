import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Waveform } from "./Waveform";

describe("Waveform", () => {
  it("renders an SVG path starting at the origin", () => {
    const { container } = render(<Waveform />);
    const path = container.querySelector("path")!;
    expect(path).toBeInTheDocument();
    expect(path.getAttribute("d")).toMatch(/^M 0 /);
  });

  it("draws 101 sample points (100 line segments plus the move-to start)", () => {
    const { container } = render(<Waveform />);
    const d = container.querySelector("path")!.getAttribute("d")!;
    const commands = d.split(" ").filter((token) => token === "M" || token === "L");
    expect(commands).toHaveLength(101);
  });
});
