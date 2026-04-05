import { describe, expect, it } from "vitest";
import { fitImageInPanel, getPanelSizeFromFrame } from "./comic-strip-node";

describe("getPanelSizeFromFrame", () => {
  it("preserves frame aspect ratio for panel dimensions", () => {
    const panel = getPanelSizeFromFrame({
      imageWidth: 400,
      imageHeight: 200,
    });

    expect(panel).toEqual({
      panelWidth: 900,
      panelHeight: 450,
    });
  });
});

describe("fitImageInPanel", () => {
  it("fits full image with contain behavior", () => {
    const fitted = fitImageInPanel({
      imageWidth: 400,
      imageHeight: 200,
      panelWidth: 900,
      panelHeight: 900,
      panelX: 0,
      panelY: 0,
    });

    expect(fitted.width).toBe(900);
    expect(fitted.height).toBe(450);
    expect(fitted.x).toBe(0);
    expect(fitted.y).toBe(225);
  });
});
