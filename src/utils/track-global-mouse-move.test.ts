import { describe, expect, it, vi } from "vitest";
import { trackGlobalMouseMove } from "./track-global-mouse-move";

describe("trackGlobalMouseMove", () => {
  it("invokes the callback on window mousemove", () => {
    const onMouseMove = vi.fn();
    trackGlobalMouseMove(onMouseMove);

    window.dispatchEvent(new MouseEvent("mousemove"));

    expect(onMouseMove).toHaveBeenCalledTimes(1);
  });

  it("stops tracking mousemove after a mouseup", () => {
    const onMouseMove = vi.fn();
    trackGlobalMouseMove(onMouseMove);

    window.dispatchEvent(new MouseEvent("mouseup"));
    window.dispatchEvent(new MouseEvent("mousemove"));

    expect(onMouseMove).not.toHaveBeenCalled();
  });

  it("removes its own mouseup listener after firing once", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const onMouseMove = vi.fn();
    trackGlobalMouseMove(onMouseMove);

    window.dispatchEvent(new MouseEvent("mouseup"));

    expect(removeSpy).toHaveBeenCalledWith("mousemove", onMouseMove);
    expect(removeSpy).toHaveBeenCalledWith("mouseup", expect.any(Function));
    removeSpy.mockRestore();
  });
});
