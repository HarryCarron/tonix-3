import { describe, expect, it, vi } from "vitest";
import {
  clientPointToContent,
  contentToViewport,
  elementCenterToContent,
  viewportToContent,
} from "./viewport";

describe("contentToViewport", () => {
  it("scales and translates content coordinates into viewport space", () => {
    expect(
      contentToViewport(10, 20, { scale: 2, positionX: 5, positionY: -5 })
    ).toEqual({ x: 25, y: 35 });
  });

  it("is the identity transform at scale 1 with no pan", () => {
    expect(
      contentToViewport(42, -7, { scale: 1, positionX: 0, positionY: 0 })
    ).toEqual({ x: 42, y: -7 });
  });
});

describe("viewportToContent", () => {
  it("inverts contentToViewport", () => {
    const state = { scale: 2.5, positionX: 12, positionY: -8 };
    const content = { x: 30, y: 17 };
    const viewport = contentToViewport(content.x, content.y, state);
    expect(viewportToContent(viewport.x, viewport.y, state)).toEqual(content);
  });
});

describe("clientPointToContent", () => {
  it("subtracts the host's bounding rect before converting to content space", () => {
    const host = document.createElement("div");
    vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 50,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 100,
      y: 50,
      toJSON() {},
    });

    const state = { scale: 2, positionX: 0, positionY: 0 };
    expect(clientPointToContent(120, 70, host, state)).toEqual({
      x: 10,
      y: 10,
    });
  });
});

describe("elementCenterToContent", () => {
  it("converts the element's rendered center via the host + state", () => {
    const host = document.createElement("div");
    vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON() {},
    });

    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      left: 10,
      top: 20,
      right: 30,
      bottom: 40,
      width: 20,
      height: 20,
      x: 10,
      y: 20,
      toJSON() {},
    });

    const state = { scale: 1, positionX: 0, positionY: 0 };
    expect(elementCenterToContent(el, host, state)).toEqual({ x: 20, y: 30 });
  });
});
