import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { VintageSlider } from "./VintageSlider";

describe("VintageSlider", () => {
  const config = {
    true: { value: 1, label: "On" },
    false: { value: 0, label: "Off" },
  };

  it("starts with the false option selected", () => {
    render(<VintageSlider config={config} />);
    expect(screen.getByText("Off")).toHaveClass("selected");
    expect(screen.getByText("On")).not.toHaveClass("selected");
  });

  it("toggles the selected option on click", async () => {
    const user = userEvent.setup();
    render(<VintageSlider config={config} />);

    await user.click(screen.getByText("On"));
    expect(screen.getByText("On")).toHaveClass("selected");
    expect(screen.getByText("Off")).not.toHaveClass("selected");

    await user.click(screen.getByText("Off"));
    expect(screen.getByText("Off")).toHaveClass("selected");
    expect(screen.getByText("On")).not.toHaveClass("selected");
  });
});
