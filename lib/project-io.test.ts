import { unzipSync } from "fflate";
import { beforeEach, describe, expect, it } from "vitest";
import {
  buildZipBlob,
  collectAssets,
  deserializeProject,
  serializeProject,
} from "./project-io";
import { computeEdges, useFlowStore } from "./store";

const PNG_EXT_PATTERN = /\.png$/;
const WEBP_EXT_PATTERN = /\.webp$/;

beforeEach(() => {
  useFlowStore.setState(useFlowStore.getInitialState());
});

describe("serializeProject / deserializeProject round-trip", () => {
  it("round-trips the initial state", () => {
    const json = serializeProject();
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.nodes).toEqual(useFlowStore.getState().nodes);
    expect(parsed.globalSettings).toEqual(
      useFlowStore.getState().globalSettings
    );

    deserializeProject({ json });
    const state = useFlowStore.getState();
    expect(state.nodes).toEqual(parsed.nodes);
    expect(state.globalSettings).toEqual(parsed.globalSettings);
  });

  it("round-trips a populated state with all node types", () => {
    const store = useFlowStore.getState();
    store.setStylePreset({ preset: "pixar-3d" });
    store.setSettingDescription({ description: "A fantasy world" });

    store.addLocationNode();
    const locNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "location");
    if (!locNode) {
      throw new Error("No location node");
    }
    useFlowStore.getState().setLocationDescription({
      nodeId: locNode.id,
      description: "Enchanted forest",
    });
    useFlowStore.getState().setLocationGeneratedImage({
      nodeId: locNode.id,
      image: "data:image/png;base64,abc123",
    });

    useFlowStore.getState().addCharacterNode();
    const charNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "character");
    if (!charNode) {
      throw new Error("No character node");
    }
    useFlowStore.getState().setCharacterDescription({
      nodeId: charNode.id,
      description: "Brave knight",
    });
    useFlowStore.getState().setCharacterImages({
      nodeId: charNode.id,
      frontalImage: "data:image/png;base64,front1",
      sideImage: "data:image/png;base64,side1",
    });

    useFlowStore.getState().addStoryImageNode();
    const siNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "storyImage");
    if (!siNode) {
      throw new Error("No story image node");
    }
    useFlowStore.getState().setStoryImageSceneDescription({
      nodeId: siNode.id,
      sceneDescription: "Battle scene",
    });
    useFlowStore.getState().setStoryImageGeneratedImage({
      nodeId: siNode.id,
      image: "data:image/png;base64,story1",
    });

    useFlowStore.getState().addMovieNode();
    useFlowStore.getState().addComicStripNode();
    const comicNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "comicStrip");
    if (!comicNode) {
      throw new Error("No comic strip node");
    }
    useFlowStore.getState().setComicStripGeneratedPngUrl({
      nodeId: comicNode.id,
      url: "data:image/png;base64,AQID",
    });
    useFlowStore.getState().setComicStripGeneratedPdfUrl({
      nodeId: comicNode.id,
      url: "data:application/pdf;base64,BAUG",
    });

    const beforeJson = serializeProject();
    const beforeState = useFlowStore.getState();

    useFlowStore.setState(useFlowStore.getInitialState());
    expect(useFlowStore.getState().nodes).toHaveLength(2);

    deserializeProject({ json: beforeJson });
    const afterState = useFlowStore.getState();

    expect(afterState.nodes).toEqual(beforeState.nodes);
    expect(afterState.globalSettings).toEqual(beforeState.globalSettings);
    expect(afterState.edges).toEqual(computeEdges(afterState.nodes));
  });

  it("rejects invalid version", () => {
    const json = JSON.stringify({
      version: 999,
      nodes: [],
      globalSettings: {},
    });
    expect(() => deserializeProject({ json })).toThrow(
      "Unsupported project version"
    );
  });

  it("rejects missing nodes", () => {
    const json = JSON.stringify({ version: 1, globalSettings: {} });
    expect(() => deserializeProject({ json })).toThrow(
      "Invalid project data: missing nodes array"
    );
  });
});

describe("collectAssets", () => {
  it("returns empty array for initial state", () => {
    const assets = collectAssets({ nodes: useFlowStore.getState().nodes });
    expect(assets).toHaveLength(0);
  });

  it("collects location images", () => {
    useFlowStore.getState().addLocationNode();
    const locNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "location");
    if (!locNode) {
      throw new Error("No location node");
    }
    useFlowStore.getState().setLocationGeneratedImage({
      nodeId: locNode.id,
      image: "data:image/png;base64,AQID",
    });

    const assets = collectAssets({ nodes: useFlowStore.getState().nodes });
    const locAsset = assets.find((a) => a.path.startsWith("locations/"));
    expect(locAsset).toBeDefined();
    expect(locAsset?.path).toMatch(PNG_EXT_PATTERN);
  });

  it("collects character front and side images", () => {
    useFlowStore.getState().addCharacterNode();
    const charNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "character");
    if (!charNode) {
      throw new Error("No character node");
    }
    useFlowStore.getState().setCharacterImages({
      nodeId: charNode.id,
      frontalImage: "data:image/png;base64,AQID",
      sideImage: "data:image/webp;base64,BAUG",
    });

    const assets = collectAssets({ nodes: useFlowStore.getState().nodes });
    const frontAsset = assets.find((a) => a.path.includes("-front."));
    const sideAsset = assets.find((a) => a.path.includes("-side."));
    expect(frontAsset).toBeDefined();
    expect(frontAsset?.path).toMatch(PNG_EXT_PATTERN);
    expect(sideAsset).toBeDefined();
    expect(sideAsset?.path).toMatch(WEBP_EXT_PATTERN);
  });

  it("collects story frame images", () => {
    useFlowStore.getState().addLocationNode();
    const locNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "location");
    if (!locNode) {
      throw new Error("No location node");
    }
    useFlowStore.getState().setLocationGeneratedImage({
      nodeId: locNode.id,
      image: "data:image/png;base64,AQID",
    });
    useFlowStore.getState().addCharacterNode();
    const charNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "character");
    if (!charNode) {
      throw new Error("No character node");
    }
    useFlowStore.getState().setCharacterImages({
      nodeId: charNode.id,
      frontalImage: "data:image/png;base64,AQID",
      sideImage: "data:image/png;base64,BAUG",
    });
    useFlowStore.getState().addStoryImageNode();
    const siNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "storyImage");
    if (!siNode) {
      throw new Error("No story image node");
    }
    useFlowStore.getState().setStoryImageGeneratedImage({
      nodeId: siNode.id,
      image: "data:image/png;base64,AQID",
    });
    useFlowStore.getState().setStoryImageGeneratedImage16x9({
      nodeId: siNode.id,
      image: "data:image/png;base64,BAUG",
    });

    const assets = collectAssets({ nodes: useFlowStore.getState().nodes });
    const storyAsset = assets.find((a) => a.path.startsWith("story-frames/"));
    const storyAsset16x9 = assets.find((a) =>
      a.path.startsWith("story-frames-16x9/")
    );
    expect(storyAsset).toBeDefined();
    expect(storyAsset16x9).toBeDefined();
  });

  it("collects comic strip png and pdf assets", () => {
    useFlowStore.getState().addLocationNode();
    const locNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "location");
    if (!locNode) {
      throw new Error("No location node");
    }
    useFlowStore.getState().setLocationGeneratedImage({
      nodeId: locNode.id,
      image: "data:image/png;base64,AQID",
    });
    useFlowStore.getState().addCharacterNode();
    const charNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "character");
    if (!charNode) {
      throw new Error("No character node");
    }
    useFlowStore.getState().setCharacterImages({
      nodeId: charNode.id,
      frontalImage: "data:image/png;base64,AQID",
      sideImage: "data:image/png;base64,BAUG",
    });
    useFlowStore.getState().addStoryImageNode();
    const siNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "storyImage");
    if (!siNode) {
      throw new Error("No story image node");
    }
    useFlowStore.getState().setStoryImageGeneratedImage({
      nodeId: siNode.id,
      image: "data:image/png;base64,AQID",
    });
    useFlowStore.getState().addComicStripNode();
    const comicNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "comicStrip");
    if (!comicNode) {
      throw new Error("No comic strip node");
    }
    useFlowStore.getState().setComicStripGeneratedPngUrl({
      nodeId: comicNode.id,
      url: "data:image/png;base64,AQID",
    });
    useFlowStore.getState().setComicStripGeneratedPdfUrl({
      nodeId: comicNode.id,
      url: "data:application/pdf;base64,BAUG",
    });

    const assets = collectAssets({ nodes: useFlowStore.getState().nodes });
    const comicPngAsset = assets.find(
      (a) => a.path === "comic-strip/comic-strip.png"
    );
    const comicPdfAsset = assets.find(
      (a) => a.path === "comic-strip/comic-strip.pdf"
    );

    expect(comicPngAsset).toBeDefined();
    expect(comicPdfAsset).toBeDefined();
  });
});

describe("buildZipBlob", () => {
  it("creates a valid zip with given assets", async () => {
    const testData = new Uint8Array([1, 2, 3, 4, 5]);
    const assets = [
      { path: "locations/loc-1.png", data: testData },
      { path: "characters/char-1-front.png", data: testData },
    ];

    const blob = buildZipBlob({ assets });
    expect(blob.type).toBe("application/zip");
    expect(blob.size).toBeGreaterThan(0);

    const arrayBuffer = await blob.arrayBuffer();
    const unzipped = unzipSync(new Uint8Array(arrayBuffer));
    expect(Object.keys(unzipped)).toContain("locations/loc-1.png");
    expect(Object.keys(unzipped)).toContain("characters/char-1-front.png");
    expect(Array.from(unzipped["locations/loc-1.png"])).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  it("handles empty assets array", () => {
    const blob = buildZipBlob({ assets: [] });
    expect(blob.type).toBe("application/zip");
    expect(blob.size).toBeGreaterThan(0);
  });
});
