import { describe, expect, it } from "vitest";
import { BoundingBox } from "./bounding-box";

describe("BoundingBox", () => {
  it("mounts a hidden span into the host on init", () => {
    const host = document.createElement("div");
    new BoundingBox(host).init();

    const span = host.querySelector("span")!;
    expect(span).toBeTruthy();
    expect(span.style.display).toBe("none");
    expect(span.style.position).toBe("fixed");
  });

  it("shows and positions the overlay on update", () => {
    const host = document.createElement("div");
    const box = new BoundingBox(host).init();

    box.update({ x: 10, y: 20, w: 30, h: 40 });

    const span = host.querySelector("span")!;
    expect(span.style.display).toBe("inline");
    expect(span.style.left).toBe("10px");
    expect(span.style.top).toBe("20px");
    expect(span.style.width).toBe("30px");
    expect(span.style.height).toBe("40px");
  });

  it("hides the overlay on hide", () => {
    const host = document.createElement("div");
    const box = new BoundingBox(host).init();

    box.update({ x: 0, y: 0, w: 1, h: 1 });
    box.hide();

    const span = host.querySelector("span")!;
    expect(span.style.display).toBe("none");
  });
});
