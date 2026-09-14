import { describe, expect, it, vi } from "vitest";
import { DragAndDrop } from "./drag-and-drop";

function mouseEvent(type: string) {
  return new MouseEvent(type, { bubbles: true });
}

describe("DragAndDrop", () => {
  it("reports 'start' when the host receives mousedown", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const handler = vi.fn();

    new DragAndDrop().setHost(host).listen(handler);
    host.dispatchEvent(mouseEvent("mousedown"));

    expect(handler).toHaveBeenCalledWith({ type: "start", e: expect.anything() });
  });

  it("tracks mousemove on document (not just the host) once a drag starts", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const handler = vi.fn();

    new DragAndDrop().setHost(host).listen(handler);
    host.dispatchEvent(mouseEvent("mousedown"));
    document.dispatchEvent(mouseEvent("mousemove"));

    expect(handler).toHaveBeenCalledWith({ type: "dragging", e: expect.anything() });
  });

  it("reports 'done' on mouseup and stops tracking further moves", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const handler = vi.fn();

    new DragAndDrop().setHost(host).listen(handler);
    host.dispatchEvent(mouseEvent("mousedown"));
    document.dispatchEvent(mouseEvent("mouseup"));

    expect(handler).toHaveBeenCalledWith({ type: "done", e: expect.anything() });

    handler.mockClear();
    document.dispatchEvent(mouseEvent("mousemove"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("stops listening for new drags entirely once done() is called", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const handler = vi.fn();

    const dd = new DragAndDrop().setHost(host);
    dd.listen(handler);
    dd.done();

    host.dispatchEvent(mouseEvent("mousedown"));
    expect(handler).not.toHaveBeenCalled();
  });
});
