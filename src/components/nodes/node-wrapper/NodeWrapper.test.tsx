import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { NodeWrapper } from "./NodeWrapper";
import { ConnectionsProvider } from "@/context/connections/ConnectionsContext";

vi.mock("@/utils/drag-and-drop", () => ({
  DragAndDrop: class {
    setHost() {
      return this;
    }
    listen() {}
    done() {}
  },
}));

function renderWithProvider(ui: ReactNode) {
  return render(<ConnectionsProvider>{ui}</ConnectionsProvider>);
}

describe("NodeWrapper", () => {
  it("renders its children inside the node chrome", () => {
    renderWithProvider(
      <NodeWrapper id="node-1">
        <div>node content</div>
      </NodeWrapper>,
    );

    expect(screen.getByText("node content")).toBeInTheDocument();
  });

  it("renders an input terminal and an output terminal for the given node id", () => {
    const { container } = renderWithProvider(
      <NodeWrapper id="node-1">
        <div>node content</div>
      </NodeWrapper>,
    );

    const input = container.querySelector('[data-terminal-side="input"]');
    const output = container.querySelector('[data-terminal-side="output"]');

    expect(input).toHaveAttribute("data-node-id", "node-1");
    expect(output).toHaveAttribute("data-node-id", "node-1");
  });

  it("renders the mute, settings, and close chrome buttons", () => {
    renderWithProvider(
      <NodeWrapper id="node-1">
        <div>node content</div>
      </NodeWrapper>,
    );

    expect(screen.getAllByRole("button")).toHaveLength(4);
  });
});
