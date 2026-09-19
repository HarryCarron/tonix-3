import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StaticEditableInput } from "./StaticEditableInput";

describe("StaticEditableInput", () => {
  it("renders the value as static text by default", () => {
    render(<StaticEditableInput value="Polysynth" onChange={vi.fn()} />);

    expect(screen.getByText("Polysynth")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("switches to an editable input when the text is clicked", async () => {
    const user = userEvent.setup();
    render(<StaticEditableInput value="Polysynth" onChange={vi.fn()} />);

    await user.click(screen.getByText("Polysynth"));

    expect(screen.getByRole("textbox")).toHaveValue("Polysynth");
  });

  it("calls onChange with the current value and reverts to static text on blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StaticEditableInput value="Polysynth" onChange={onChange} />);

    await user.click(screen.getByText("Polysynth"));
    await user.tab();

    expect(onChange).toHaveBeenCalledWith("Polysynth");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Polysynth")).toBeInTheDocument();
  });
});
