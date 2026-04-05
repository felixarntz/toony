import { unzipSync } from "fflate";
import { beforeEach, describe, expect, it } from "vitest";
import {
  buildZipBlob,
  collectAssets,
  deserializeProject,
  serializeProject,
} from "./project-io";
import { computeEdges, useFlowStore } from "./store";

beforeEach(() => {
  useFlowStore.setState(useFlowStore.getInitialState());
});

describe("serializeProject / deserializeProject round-trip", () => {
  it("round-trips the initial state", async () => {
    const json = await serializeProject();
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

  it("round-trips a populated state with all node types", async () => {
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

    const beforeJson = await serializeProject();
    const beforeState = useFlowStore.getState();

    useFlowStore.setState(useFlowStore.getInitialState());
    expect(useFlowStore.getState().nodes).toHaveLength(2);

    deserializeProject({ json: beforeJson });
    const afterState = useFlowStore.getState();

    expect(afterState.nodes).toEqual(beforeState.nodes);
    expect(afterState.globalSettings).toEqual(beforeState.globalSettings);
    expect(afterState.edges).toEqual(computeEdges(afterState.nodes));
  });

  it("serializes movie blob urls to data urls", async () => {
    setupMovieNodeWithGeneratedBlobVideo();

    const json = await serializeProject();
    const parsed = JSON.parse(json) as {
      nodes: Array<{
        type: string;
        data: { generatedVideoUrl?: string | null };
      }>;
    };
    const movieNode = parsed.nodes.find((node) => node.type === "movie");

    expect(movieNode).toBeDefined();
    expect(movieNode?.data.generatedVideoUrl?.startsWith("data:video/")).toBe(
      true
    );
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

function setupMovieNodeWithGeneratedBlobVideo() {
  useFlowStore.getState().addLocationNode();
  const locationNode = useFlowStore
    .getState()
    .nodes.find((node) => node.type === "location");
  if (!locationNode) {
    throw new Error("No location node");
  }
  useFlowStore.getState().setLocationGeneratedImage({
    nodeId: locationNode.id,
    image: "data:image/png;base64,AQID",
  });

  useFlowStore.getState().addCharacterNode();
  const characterNode = useFlowStore
    .getState()
    .nodes.find((node) => node.type === "character");
  if (!characterNode) {
    throw new Error("No character node");
  }
  useFlowStore.getState().setCharacterImages({
    nodeId: characterNode.id,
    frontalImage: "data:image/png;base64,AQID",
    sideImage: "data:image/png;base64,BAUG",
  });

  useFlowStore.getState().addStoryImageNode();
  const storyNode = useFlowStore
    .getState()
    .nodes.find((node) => node.type === "storyImage");
  if (!storyNode) {
    throw new Error("No story image node");
  }
  useFlowStore.getState().setStoryImageGeneratedImage({
    nodeId: storyNode.id,
    image: "data:image/png;base64,AQID",
  });

  useFlowStore.getState().addMovieNode();
  const movieNode = useFlowStore
    .getState()
    .nodes.find((node) => node.type === "movie");
  if (!movieNode) {
    throw new Error("No movie node");
  }

  const movieBlob = new Blob([new Uint8Array([1, 2, 3, 4])], {
    type: "video/mp4",
  });
  const movieBlobUrl = URL.createObjectURL(movieBlob);
  useFlowStore.getState().setMovieGeneratedVideoUrl({
    nodeId: movieNode.id,
    url: movieBlobUrl,
  });
}

describe("collectAssets", () => {
  it("returns empty array for initial state", () => {
    const assets = collectAssets({ nodes: useFlowStore.getState().nodes });
    expect(assets).toHaveLength(0);
  });

  it("collects location images using normalized location names", () => {
    useFlowStore.getState().addLocationNode();
    const locNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "location");
    if (!locNode) {
      throw new Error("No location node");
    }
    useFlowStore.getState().setLocationName({
      nodeId: locNode.id,
      name: "Misty Forest!",
    });
    useFlowStore.getState().setLocationGeneratedImage({
      nodeId: locNode.id,
      image: "data:image/png;base64,AQID",
    });

    const assets = collectAssets({ nodes: useFlowStore.getState().nodes });
    expect(assets.map((a) => a.path)).toContain("locations/misty-forest.png");
  });

  it("collects raw base64 image strings without data url prefixes", () => {
    useFlowStore.getState().addLocationNode();
    const locationNode = useFlowStore
      .getState()
      .nodes.find((node) => node.type === "location");
    if (!locationNode) {
      throw new Error("No location node");
    }
    useFlowStore.getState().setLocationGeneratedImage({
      nodeId: locationNode.id,
      image: "AQID",
    });

    useFlowStore.getState().addCharacterNode();
    const characterNode = useFlowStore
      .getState()
      .nodes.find((node) => node.type === "character");
    if (!characterNode) {
      throw new Error("No character node");
    }
    useFlowStore.getState().setCharacterImages({
      nodeId: characterNode.id,
      frontalImage: "AQID",
      sideImage: "BAUG",
    });

    useFlowStore.getState().addStoryImageNode();
    const storyNode = useFlowStore
      .getState()
      .nodes.find((node) => node.type === "storyImage");
    if (!storyNode) {
      throw new Error("No story image node");
    }
    useFlowStore.getState().setStoryImageGeneratedImage({
      nodeId: storyNode.id,
      image: "AQID",
    });

    const assets = collectAssets({ nodes: useFlowStore.getState().nodes });
    const paths = assets.map((asset) => asset.path);

    expect(paths).toContain("locations/location.png");
    expect(paths).toContain("characters/character-front.png");
    expect(paths).toContain("characters/character-side.png");
    expect(paths).toContain("story-frames/01.png");
  });

  it("uses fallback names when location and character names are empty", () => {
    useFlowStore.getState().addLocationNode();
    const locationNode = useFlowStore
      .getState()
      .nodes.find((node) => node.type === "location");
    if (!locationNode) {
      throw new Error("No location node");
    }
    useFlowStore.getState().setLocationGeneratedImage({
      nodeId: locationNode.id,
      image: "data:image/png;base64,AQID",
    });

    useFlowStore.getState().addCharacterNode();
    const characterNode = useFlowStore
      .getState()
      .nodes.find((node) => node.type === "character");
    if (!characterNode) {
      throw new Error("No character node");
    }
    useFlowStore.getState().setCharacterImages({
      nodeId: characterNode.id,
      frontalImage: "data:image/png;base64,AQID",
      sideImage: "data:image/png;base64,BAUG",
    });

    const assets = collectAssets({ nodes: useFlowStore.getState().nodes });
    const paths = assets.map((a) => a.path);

    expect(paths).toContain("locations/location.png");
    expect(paths).toContain("characters/character-front.png");
    expect(paths).toContain("characters/character-side.png");
  });

  it("collects character front and side images using normalized character names", () => {
    useFlowStore.getState().addCharacterNode();
    const characterNode = useFlowStore
      .getState()
      .nodes.find((node) => node.type === "character");
    if (!characterNode) {
      throw new Error("No character node");
    }
    useFlowStore.getState().setCharacterName({
      nodeId: characterNode.id,
      name: "Captain Nova",
    });
    useFlowStore.getState().setCharacterImages({
      nodeId: characterNode.id,
      frontalImage: "data:image/png;base64,AQID",
      sideImage: "data:image/webp;base64,BAUG",
    });

    const assets = collectAssets({ nodes: useFlowStore.getState().nodes });
    const paths = assets.map((a) => a.path);
    expect(paths).toContain("characters/captain-nova-front.png");
    expect(paths).toContain("characters/captain-nova-side.webp");
  });

  it("collects story frame images using two-digit story position numbers", () => {
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
    useFlowStore.getState().addStoryImageNode();

    const storyNodes = useFlowStore
      .getState()
      .nodes.filter((node) => node.type === "storyImage");
    const [firstStoryNode, secondStoryNode] = storyNodes;
    if (!(firstStoryNode && secondStoryNode)) {
      throw new Error("Expected two story image nodes");
    }
    useFlowStore.getState().setStoryImageGeneratedImage({
      nodeId: firstStoryNode.id,
      image: "data:image/png;base64,AQID",
    });
    useFlowStore.getState().setStoryImageGeneratedImage16x9({
      nodeId: firstStoryNode.id,
      image: "data:image/png;base64,BAUG",
    });
    useFlowStore.getState().setStoryImageGeneratedImage({
      nodeId: secondStoryNode.id,
      image: "data:image/webp;base64,BAUG",
    });

    const assets = collectAssets({ nodes: useFlowStore.getState().nodes });
    const paths = assets.map((a) => a.path);
    expect(paths).toContain("story-frames/01.png");
    expect(paths).toContain("story-frames/02.webp");
    expect(paths.some((path) => path.includes("16x9"))).toBe(false);
  });

  it("appends numeric suffixes for duplicate normalized names", () => {
    useFlowStore.getState().addLocationNode();
    useFlowStore.getState().addLocationNode();
    const locationNodes = useFlowStore
      .getState()
      .nodes.filter((node) => node.type === "location");
    const [firstLocation, secondLocation] = locationNodes;
    if (!(firstLocation && secondLocation)) {
      throw new Error("Expected two location nodes");
    }

    useFlowStore.getState().setLocationName({
      nodeId: firstLocation.id,
      name: "The City",
    });
    useFlowStore.getState().setLocationName({
      nodeId: secondLocation.id,
      name: "the-city",
    });
    useFlowStore.getState().setLocationGeneratedImage({
      nodeId: firstLocation.id,
      image: "data:image/png;base64,AQID",
    });
    useFlowStore.getState().setLocationGeneratedImage({
      nodeId: secondLocation.id,
      image: "data:image/png;base64,BAUG",
    });

    useFlowStore.getState().addCharacterNode();
    useFlowStore.getState().addCharacterNode();
    const characterNodes = useFlowStore
      .getState()
      .nodes.filter((node) => node.type === "character");
    const [firstCharacter, secondCharacter] = characterNodes;
    if (!(firstCharacter && secondCharacter)) {
      throw new Error("Expected two character nodes");
    }

    useFlowStore.getState().setCharacterName({
      nodeId: firstCharacter.id,
      name: "hero",
    });
    useFlowStore.getState().setCharacterName({
      nodeId: secondCharacter.id,
      name: "Hero!!",
    });
    useFlowStore.getState().setCharacterImages({
      nodeId: firstCharacter.id,
      frontalImage: "data:image/png;base64,AQID",
      sideImage: null,
    });
    useFlowStore.getState().setCharacterImages({
      nodeId: secondCharacter.id,
      frontalImage: "data:image/png;base64,BAUG",
      sideImage: null,
    });

    const assets = collectAssets({ nodes: useFlowStore.getState().nodes });
    const paths = assets.map((a) => a.path);

    expect(paths).toContain("locations/the-city.png");
    expect(paths).toContain("locations/the-city-2.png");
    expect(paths).toContain("characters/hero-front.png");
    expect(paths).toContain("characters/hero-front-2.png");
  });

  it("does not include movie or comic strip assets", () => {
    setupMovieNodeWithGeneratedBlobVideo();
    useFlowStore.getState().addComicStripNode();
    const comicNode = useFlowStore
      .getState()
      .nodes.find((node) => node.type === "comicStrip");
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
    const paths = assets.map((asset) => asset.path);

    expect(paths.some((path) => path.startsWith("movie/"))).toBe(false);
    expect(paths.some((path) => path.startsWith("comic-strip/"))).toBe(false);
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
