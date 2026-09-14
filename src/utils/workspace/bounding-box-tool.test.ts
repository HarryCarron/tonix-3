import { describe, expect, it, vi } from "vitest";
import { BoundingBoxTool } from "./bounding-box-tool";

function mouseEvent(type: string, x: number, y: number) {
  return new MouseEvent(type, { bubbles: true, clientX: x, clientY: y });
}

describe("BoundingBoxTool", () => {
  it("reports the rect spanning the drag start and end points on done", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);

    const tool = new BoundingBoxTool().setHost(host);
    const listener = vi.fn();
    tool.listen(listener);

    host.dispatchEvent(mouseEvent("mousedown", 10, 20));
    document.dispatchEvent(mouseEvent("mousemove", 50, 80));
    document.dispatchEvent(mouseEvent("mouseup", 50, 80));

    expect(listener).toHaveBeenCalledWith({ x: 10, y: 20, w: 40, h: 60 });
  });

  it("normalizes the rect origin when dragging up/left", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);

    const tool = new BoundingBoxTool().setHost(host);
    const listener = vi.fn();
    tool.listen(listener);

    host.dispatchEvent(mouseEvent("mousedown", 100, 100));
    document.dispatchEvent(mouseEvent("mousemove", 40, 30));
    document.dispatchEvent(mouseEvent("mouseup", 40, 30));

    expect(listener).toHaveBeenCalledWith({ x: 40, y: 30, w: 60, h: 70 });
  });

  it("hides the overlay and stops listening after done() is invoked", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);

    const tool = new BoundingBoxTool().setHost(host);
    const listener = vi.fn();
    tool.listen(listener);
    tool.done!();

    host.dispatchEvent(mouseEvent("mousedown", 0, 0));
    expect(listener).not.toHaveBeenCalled();
  });
});
