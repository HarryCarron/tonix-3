import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Tools from "./Tools";
import { EditorTool } from "@/types/editor/EditorTools";

describe("Tools", () => {
  it("renders the add, pan, and mag tool buttons", () => {
    render(<Tools editorTool={EditorTool.add} setEditorTool={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("highlights the pan button when it is the active tool", () => {
    render(<Tools editorTool={EditorTool.pan} setEditorTool={vi.fn()} />);
    const [, panButton, magButton] = screen.getAllByRole("button");
    expect(panButton.className).toContain("border-stone-400");
    expect(magButton.className).not.toContain("border-stone-400");
  });

  it("highlights the mag button when it is the active tool", () => {
    render(<Tools editorTool={EditorTool.mag} setEditorTool={vi.fn()} />);
    const [, panButton, magButton] = screen.getAllByRole("button");
    expect(magButton.className).toContain("border-stone-400");
    expect(panButton.className).not.toContain("border-stone-400");
  });

  it("calls setEditorTool with the clicked tool", () => {
    const setEditorTool = vi.fn();
    render(<Tools editorTool={EditorTool.add} setEditorTool={setEditorTool} />);
    const [addButton, panButton, magButton] = screen.getAllByRole("button");

    addButton.click();
    expect(setEditorTool).toHaveBeenCalledWith(EditorTool.add);

    panButton.click();
    expect(setEditorTool).toHaveBeenCalledWith(EditorTool.pan);

    magButton.click();
    expect(setEditorTool).toHaveBeenCalledWith(EditorTool.mag);
  });
});
