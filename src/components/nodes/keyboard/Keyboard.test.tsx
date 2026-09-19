import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import Keyboard from "./Keyboard";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
});

describe("Keyboard", () => {
  it("renders 28 natural keys (7 per octave x 4 octaves)", () => {
    const { container } = render(<Keyboard />);
    expect(container.querySelectorAll(".natural-key")).toHaveLength(28);
  });

  it("renders 5 minor (sharp/flat) keys per octave", () => {
    const { container } = render(<Keyboard />);
    // [0,1,3,4,5] of every 7 natural keys get a minor key -> 5 per octave x 4
    expect(container.querySelectorAll(".minor-key")).toHaveLength(20);
  });

  it("renders the pattern select toolbar", () => {
    const { getByRole } = render(<Keyboard />);
    expect(getByRole("combobox")).toBeInTheDocument();
  });
});
