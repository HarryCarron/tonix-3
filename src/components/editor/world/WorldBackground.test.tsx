import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorldBackground } from "./WorldBackground";

describe("WorldBackground", () => {
  it("defaults to filling its container at 100%", () => {
    const { container } = render(<WorldBackground />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "100%");
    expect(svg).toHaveAttribute("height", "100%");
  });

  it("uses the given width/height and appends the extra className", () => {
    const { container } = render(
      <WorldBackground width="4000px" height="4000px" className="extra" />,
    );
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "4000px");
    expect(svg).toHaveAttribute("height", "4000px");
    expect(svg).toHaveClass("extra");
  });

  it("renders the dot pattern and its backing rects", () => {
    const { container } = render(<WorldBackground />);
    expect(container.querySelector("pattern#pattern-circles")).toBeInTheDocument();
    expect(container.querySelector("circle#pattern-circle")).toBeInTheDocument();
    expect(container.querySelector("rect#rect")).toBeInTheDocument();
  });
});
