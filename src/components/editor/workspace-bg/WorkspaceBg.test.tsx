import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkspaceBg } from "./WorkspaceBg";
import { ENV } from "@/env";

describe("WorkspaceBg", () => {
  it("sizes the svg to the world dimensions and renders the dot pattern", () => {
    const { container } = render(<WorkspaceBg />);
    const svg = container.querySelector("svg")!;

    expect(svg).toHaveAttribute("width", `${ENV.worldDims}px`);
    expect(svg).toHaveAttribute("height", `${ENV.worldDims}px`);
    expect(container.querySelector("pattern#pattern-circles")).toBeInTheDocument();
    expect(container.querySelector("rect#rect")).toBeInTheDocument();
  });
});
