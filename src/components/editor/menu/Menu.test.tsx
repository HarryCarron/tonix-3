import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Menu from "./Menu";

describe("Menu", () => {
  it("renders the app name and the default project name", () => {
    render(<Menu />);
    expect(screen.getByText("Tonix")).toBeInTheDocument();
    expect(screen.getByText("Blank Project")).toBeInTheDocument();
  });
});
