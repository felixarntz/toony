import { describe, expect, it } from "vitest";
import {
  buildComicStripLayout,
  fitImageInPanel,
  getImageDimensionsFromPngDataUrl,
  getPanelSizeFromFrame,
} from "./comic-strip-node";

describe("getPanelSizeFromFrame", () => {
  it("preserves frame aspect ratio for panel dimensions", () => {
    const panel = getPanelSizeFromFrame({
      imageWidth: 400,
      imageHeight: 200,
    });

    expect(panel).toEqual({
      panelWidth: 1800,
      panelHeight: 900,
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

describe("buildComicStripLayout", () => {
  it("sizes each panel from its own frame aspect ratio", () => {
    const layout = buildComicStripLayout({
      images: [
        { width: 1600, height: 900 } as HTMLImageElement,
        { width: 1024, height: 1024 } as HTMLImageElement,
      ],
    });

    expect(layout.canvasWidth).toBe(2580);
    expect(layout.canvasHeight).toBe(956);
    expect(layout.panels[0]).toMatchObject({
      panelWidth: 1600,
      panelHeight: 900,
      panelX: 28,
    });
    expect(layout.panels[1]).toMatchObject({
      panelWidth: 900,
      panelHeight: 900,
      panelX: 1652,
    });
  });

  it("keeps a vertical gap between rows", () => {
    const layout = buildComicStripLayout({
      images: [
        { width: 1600, height: 900 } as HTMLImageElement,
        { width: 1024, height: 1024 } as HTMLImageElement,
        { width: 900, height: 1600 } as HTMLImageElement,
      ],
    });

    expect(layout.panels[2]?.panelY).toBe(952);
  });
});

describe("getImageDimensionsFromPngDataUrl", () => {
  it("extracts dimensions from png data urls", () => {
    const pngDataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5WZ6kAAAAASUVORK5CYII=";
    const dimensions = getImageDimensionsFromPngDataUrl({
      dataUrl: pngDataUrl,
    });

    expect(dimensions).toEqual({
      width: 1,
      height: 1,
    });
  });

  it("returns null for non-png data urls", () => {
    const dimensions = getImageDimensionsFromPngDataUrl({
      dataUrl: "data:image/jpeg;base64,ZmFrZQ==",
    });

    expect(dimensions).toBeNull();
  });
});
