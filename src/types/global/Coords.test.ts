import { describe, expect, it } from "vitest";
import { Coords } from "./Coords";

describe("Coords", () => {
  it("defaults to (0, 0)", () => {
    const c = new Coords();
    expect(c.x).toBe(0);
    expect(c.y).toBe(0);
  });

  it("stores the given x/y", () => {
    const c = new Coords(3, 7);
    expect(c.x).toBe(3);
    expect(c.y).toBe(7);
  });

  it("formats x/y as CSS pixel strings", () => {
    const c = new Coords(3, -7);
    expect(c.xPx).toBe("3px");
    expect(c.yPx).toBe("-7px");
  });

  it("builds a Coords from a MouseEvent's clientX/clientY", () => {
    const event = new MouseEvent("mousemove", { clientX: 12, clientY: 34 });
    const c = Coords.eventToCoord(event);
    expect(c).toBeInstanceOf(Coords);
    expect(c.x).toBe(12);
    expect(c.y).toBe(34);
  });
});
