import { beforeEach, describe, expect, it } from "vitest";
import {
  STORY_IMAGE_LEFT_TARGET_HANDLE_ID,
  STORY_IMAGE_RIGHT_SOURCE_HANDLE_ID,
} from "./edge-handles";
import {
  MAX_CHARACTER_NODES,
  MAX_COMIC_STRIP_NODES,
  MAX_LOCATION_NODES,
  MAX_MOVIE_NODES,
  MAX_STORY_IMAGE_NODES,
  useFlowStore,
} from "./store";

function getLocationNodeId(): string {
  const node = useFlowStore.getState().nodes.find((n) => n.type === "location");
  if (!node) {
    throw new Error("No location node found");
  }
  return node.id;
}

function getCharacterNodeId(): string {
  const node = useFlowStore
    .getState()
    .nodes.find((n) => n.type === "character");
  if (!node) {
    throw new Error("No character node found");
  }
  return node.id;
}

beforeEach(() => {
  useFlowStore.setState(useFlowStore.getInitialState());
});

describe("store - location nodes", () => {
  it("starts with no location nodes", () => {
    const state = useFlowStore.getState();
    const locationNodes = state.nodes.filter((n) => n.type === "location");
    expect(locationNodes).toHaveLength(0);
  });

  it("adds a location node", () => {
    useFlowStore.getState().addLocationNode();
    const state = useFlowStore.getState();
    const locationNodes = state.nodes.filter((n) => n.type === "location");
    expect(locationNodes).toHaveLength(1);
    expect(locationNodes[0].type).toBe("location");
    expect(locationNodes[0].data).toEqual({
      name: "",
      description: "",
      error: null,
      generatedImage: null,
      isGenerating: false,
    });
  });

  it("enforces max location constraint", () => {
    const store = useFlowStore.getState();
    for (let i = 0; i < MAX_LOCATION_NODES + 1; i++) {
      store.addLocationNode();
    }
    const state = useFlowStore.getState();
    const locationNodes = state.nodes.filter((n) => n.type === "location");
    expect(locationNodes).toHaveLength(MAX_LOCATION_NODES);
  });

  it("removes a location node", () => {
    useFlowStore.getState().addLocationNode();
    const nodeId = getLocationNodeId();

    useFlowStore.getState().removeLocationNode({ nodeId });
    const afterRemove = useFlowStore.getState();
    const locationNodes = afterRemove.nodes.filter(
      (n) => n.type === "location"
    );
    expect(locationNodes).toHaveLength(0);
  });

  it("getLocationCount returns correct count", () => {
    expect(useFlowStore.getState().getLocationCount()).toBe(0);
    useFlowStore.getState().addLocationNode();
    expect(useFlowStore.getState().getLocationCount()).toBe(1);
    useFlowStore.getState().addLocationNode();
    expect(useFlowStore.getState().getLocationCount()).toBe(2);
  });
});

describe("store - location data updates", () => {
  it("updates location description", () => {
    useFlowStore.getState().addLocationNode();
    const nodeId = getLocationNodeId();

    useFlowStore.getState().setLocationDescription({
      nodeId,
      description: "A haunted forest",
    });

    const updated = useFlowStore.getState().nodes.find((n) => n.id === nodeId);
    expect(updated?.data).toHaveProperty("description", "A haunted forest");
  });

  it("updates location generated image", () => {
    useFlowStore.getState().addLocationNode();
    const nodeId = getLocationNodeId();

    useFlowStore.getState().setLocationGeneratedImage({
      nodeId,
      image: "base64data",
    });

    const updated = useFlowStore.getState().nodes.find((n) => n.id === nodeId);
    expect(updated?.data).toHaveProperty("generatedImage", "base64data");
  });

  it("updates location isGenerating state", () => {
    useFlowStore.getState().addLocationNode();
    const nodeId = getLocationNodeId();

    useFlowStore.getState().setLocationIsGenerating({
      nodeId,
      isGenerating: true,
    });

    const updated = useFlowStore.getState().nodes.find((n) => n.id === nodeId);
    expect(updated?.data).toHaveProperty("isGenerating", true);
  });
});

describe("computeEdges", () => {
  it("creates edges from style and setting to location nodes", () => {
    useFlowStore.getState().addLocationNode();
    const state = useFlowStore.getState();
    const { edges } = state;
    const nodeId = getLocationNodeId();

    const styleToLocation = edges.find(
      (e) => e.source === "style" && e.target === nodeId
    );
    const settingToLocation = edges.find(
      (e) => e.source === "setting" && e.target === nodeId
    );

    expect(styleToLocation).toBeDefined();
    expect(settingToLocation).toBeDefined();
  });

  it("returns no downstream edges when only style and setting exist", () => {
    const state = useFlowStore.getState();
    expect(state.edges).toHaveLength(0);
  });

  it("edges update when location is removed", () => {
    useFlowStore.getState().addLocationNode();
    const nodeId = getLocationNodeId();

    useFlowStore.getState().removeLocationNode({ nodeId });

    const state = useFlowStore.getState();
    expect(state.edges).toHaveLength(0);
  });

  it("creates edges from style and setting to character nodes", () => {
    useFlowStore.getState().addCharacterNode();
    const state = useFlowStore.getState();
    const { edges } = state;
    const nodeId = getCharacterNodeId();

    const styleToCharacter = edges.find(
      (e) => e.source === "style" && e.target === nodeId
    );
    const settingToCharacter = edges.find(
      (e) => e.source === "setting" && e.target === nodeId
    );

    expect(styleToCharacter).toBeDefined();
    expect(settingToCharacter).toBeDefined();
  });

  it("edges update when character is removed", () => {
    useFlowStore.getState().addCharacterNode();
    const nodeId = getCharacterNodeId();

    useFlowStore.getState().removeCharacterNode({ nodeId });

    const state = useFlowStore.getState();
    expect(state.edges).toHaveLength(0);
  });
});

describe("store - character nodes", () => {
  it("starts with no character nodes", () => {
    const state = useFlowStore.getState();
    const characterNodes = state.nodes.filter((n) => n.type === "character");
    expect(characterNodes).toHaveLength(0);
  });

  it("adds a character node", () => {
    useFlowStore.getState().addCharacterNode();
    const state = useFlowStore.getState();
    const characterNodes = state.nodes.filter((n) => n.type === "character");
    expect(characterNodes).toHaveLength(1);
    expect(characterNodes[0].type).toBe("character");
    expect(characterNodes[0].data).toEqual({
      name: "",
      description: "",
      error: null,
      frontalImage: null,
      sideImage: null,
      isGenerating: false,
    });
  });

  it("enforces max character constraint", () => {
    const store = useFlowStore.getState();
    for (let i = 0; i < MAX_CHARACTER_NODES + 1; i++) {
      store.addCharacterNode();
    }
    const state = useFlowStore.getState();
    const characterNodes = state.nodes.filter((n) => n.type === "character");
    expect(characterNodes).toHaveLength(MAX_CHARACTER_NODES);
  });

  it("removes a character node", () => {
    useFlowStore.getState().addCharacterNode();
    const nodeId = getCharacterNodeId();

    useFlowStore.getState().removeCharacterNode({ nodeId });
    const afterRemove = useFlowStore.getState();
    const characterNodes = afterRemove.nodes.filter(
      (n) => n.type === "character"
    );
    expect(characterNodes).toHaveLength(0);
  });

  it("getCharacterCount returns correct count", () => {
    expect(useFlowStore.getState().getCharacterCount()).toBe(0);
    useFlowStore.getState().addCharacterNode();
    expect(useFlowStore.getState().getCharacterCount()).toBe(1);
    useFlowStore.getState().addCharacterNode();
    expect(useFlowStore.getState().getCharacterCount()).toBe(2);
  });
});

describe("store - character data updates", () => {
  it("updates character description", () => {
    useFlowStore.getState().addCharacterNode();
    const nodeId = getCharacterNodeId();

    useFlowStore.getState().setCharacterDescription({
      nodeId,
      description: "A tall warrior",
    });

    const updated = useFlowStore.getState().nodes.find((n) => n.id === nodeId);
    expect(updated?.data).toHaveProperty("description", "A tall warrior");
  });

  it("updates character images", () => {
    useFlowStore.getState().addCharacterNode();
    const nodeId = getCharacterNodeId();

    useFlowStore.getState().setCharacterImages({
      nodeId,
      frontalImage: "frontal-base64",
      sideImage: "side-base64",
    });

    const updated = useFlowStore.getState().nodes.find((n) => n.id === nodeId);
    expect(updated?.data).toHaveProperty("frontalImage", "frontal-base64");
    expect(updated?.data).toHaveProperty("sideImage", "side-base64");
  });

  it("updates character isGenerating state", () => {
    useFlowStore.getState().addCharacterNode();
    const nodeId = getCharacterNodeId();

    useFlowStore.getState().setCharacterIsGenerating({
      nodeId,
      isGenerating: true,
    });

    const updated = useFlowStore.getState().nodes.find((n) => n.id === nodeId);
    expect(updated?.data).toHaveProperty("isGenerating", true);
  });
});

function setupCompletedLocationAndCharacter() {
  useFlowStore.getState().addLocationNode();
  const locId = getLocationNodeId();
  useFlowStore.getState().setLocationDescription({
    nodeId: locId,
    description: "A forest",
  });
  useFlowStore.getState().setLocationGeneratedImage({
    nodeId: locId,
    image: "loc-base64",
  });

  useFlowStore.getState().addCharacterNode();
  const charId = getCharacterNodeId();
  useFlowStore.getState().setCharacterDescription({
    nodeId: charId,
    description: "A warrior",
  });
  useFlowStore.getState().setCharacterImages({
    nodeId: charId,
    frontalImage: "frontal-base64",
    sideImage: "side-base64",
  });

  return { locId, charId };
}

function getStoryImageNodeId(): string {
  const node = useFlowStore
    .getState()
    .nodes.find((n) => n.type === "storyImage");
  if (!node) {
    throw new Error("No story image node found");
  }
  return node.id;
}

describe("store - canAddStoryImage", () => {
  it("returns false when no completed location or character", () => {
    expect(useFlowStore.getState().canAddStoryImage()).toBe(false);
  });

  it("returns false with completed location but no completed character", () => {
    useFlowStore.getState().addLocationNode();
    const locId = getLocationNodeId();
    useFlowStore.getState().setLocationGeneratedImage({
      nodeId: locId,
      image: "base64",
    });
    expect(useFlowStore.getState().canAddStoryImage()).toBe(false);
  });

  it("returns false with completed character but no completed location", () => {
    useFlowStore.getState().addCharacterNode();
    const charId = getCharacterNodeId();
    useFlowStore.getState().setCharacterImages({
      nodeId: charId,
      frontalImage: "f",
      sideImage: "s",
    });
    expect(useFlowStore.getState().canAddStoryImage()).toBe(false);
  });

  it("returns true with both completed location and character", () => {
    setupCompletedLocationAndCharacter();
    expect(useFlowStore.getState().canAddStoryImage()).toBe(true);
  });
});

describe("store - story image nodes", () => {
  it("starts with no story image nodes", () => {
    const state = useFlowStore.getState();
    const storyNodes = state.nodes.filter((n) => n.type === "storyImage");
    expect(storyNodes).toHaveLength(0);
  });

  it("cannot add story image without preconditions", () => {
    useFlowStore.getState().addStoryImageNode();
    const state = useFlowStore.getState();
    const storyNodes = state.nodes.filter((n) => n.type === "storyImage");
    expect(storyNodes).toHaveLength(0);
  });

  it("adds a story image node when preconditions are met", () => {
    const { locId } = setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    const state = useFlowStore.getState();
    const storyNodes = state.nodes.filter((n) => n.type === "storyImage");
    expect(storyNodes).toHaveLength(1);
    expect(storyNodes[0].type).toBe("storyImage");
    expect(storyNodes[0].data).toEqual({
      locationId: locId,
      characterIds: [],
      sceneDescription: "",
      error: null,
      generatedImage: null,
      generatedImage16x9: null,
      isGenerating: false,
    });
  });

  it("keeps location unset when multiple completed locations exist", () => {
    setupCompletedLocationAndCharacter();
    useFlowStore.getState().addLocationNode();
    const secondLocation = useFlowStore
      .getState()
      .nodes.find(
        (n) =>
          n.type === "location" &&
          (n.data as { generatedImage: string | null }).generatedImage === null
      );
    if (!secondLocation) {
      throw new Error("No second location node");
    }
    useFlowStore.getState().setLocationGeneratedImage({
      nodeId: secondLocation.id,
      image: "another-location",
    });

    useFlowStore.getState().addStoryImageNode();
    const storyNode = useFlowStore
      .getState()
      .nodes.find((n) => n.type === "storyImage");

    expect(storyNode?.data).toHaveProperty("locationId", null);
  });

  it("enforces max story image constraint", () => {
    setupCompletedLocationAndCharacter();
    for (let i = 0; i < MAX_STORY_IMAGE_NODES + 1; i++) {
      useFlowStore.getState().addStoryImageNode();
    }
    const state = useFlowStore.getState();
    const storyNodes = state.nodes.filter((n) => n.type === "storyImage");
    expect(storyNodes).toHaveLength(MAX_STORY_IMAGE_NODES);
  });

  it("removes a story image node", () => {
    setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    const nodeId = getStoryImageNodeId();

    useFlowStore.getState().removeStoryImageNode({ nodeId });
    const state = useFlowStore.getState();
    const storyNodes = state.nodes.filter((n) => n.type === "storyImage");
    expect(storyNodes).toHaveLength(0);
  });

  it("getStoryImageCount returns correct count", () => {
    setupCompletedLocationAndCharacter();
    expect(useFlowStore.getState().getStoryImageCount()).toBe(0);
    useFlowStore.getState().addStoryImageNode();
    expect(useFlowStore.getState().getStoryImageCount()).toBe(1);
  });
});

describe("store - story image data updates", () => {
  it("updates story image location id", () => {
    setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    const nodeId = getStoryImageNodeId();

    useFlowStore.getState().setStoryImageLocationId({
      nodeId,
      locationId: "location-1",
    });

    const updated = useFlowStore.getState().nodes.find((n) => n.id === nodeId);
    expect(updated?.data).toHaveProperty("locationId", "location-1");
  });

  it("updates story image character ids", () => {
    setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    const nodeId = getStoryImageNodeId();

    useFlowStore.getState().setStoryImageCharacterIds({
      nodeId,
      characterIds: ["character-1", "character-2"],
    });

    const updated = useFlowStore.getState().nodes.find((n) => n.id === nodeId);
    expect(updated?.data).toHaveProperty("characterIds", [
      "character-1",
      "character-2",
    ]);
  });

  it("updates story image scene description", () => {
    setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    const nodeId = getStoryImageNodeId();

    useFlowStore.getState().setStoryImageSceneDescription({
      nodeId,
      sceneDescription: "A battle scene",
    });

    const updated = useFlowStore.getState().nodes.find((n) => n.id === nodeId);
    expect(updated?.data).toHaveProperty("sceneDescription", "A battle scene");
  });

  it("updates story image generated image", () => {
    setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    const nodeId = getStoryImageNodeId();

    useFlowStore.getState().setStoryImageGeneratedImage({
      nodeId,
      image: "story-base64",
    });

    const updated = useFlowStore.getState().nodes.find((n) => n.id === nodeId);
    expect(updated?.data).toHaveProperty("generatedImage", "story-base64");
    expect(updated?.data).toHaveProperty("generatedImage16x9", null);
  });

  it("updates story image 16:9 generated image", () => {
    setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    const nodeId = getStoryImageNodeId();

    useFlowStore.getState().setStoryImageGeneratedImage16x9({
      nodeId,
      image: "story-16x9-base64",
    });

    const updated = useFlowStore.getState().nodes.find((n) => n.id === nodeId);
    expect(updated?.data).toHaveProperty(
      "generatedImage16x9",
      "story-16x9-base64"
    );
  });

  it("resets 16:9 variant when base story image is regenerated", () => {
    setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    const nodeId = getStoryImageNodeId();

    useFlowStore.getState().setStoryImageGeneratedImage16x9({
      nodeId,
      image: "story-16x9-base64",
    });
    useFlowStore.getState().setStoryImageGeneratedImage({
      nodeId,
      image: "story-base64-regenerated",
    });

    const updated = useFlowStore.getState().nodes.find((n) => n.id === nodeId);
    expect(updated?.data).toHaveProperty(
      "generatedImage",
      "story-base64-regenerated"
    );
    expect(updated?.data).toHaveProperty("generatedImage16x9", null);
  });

  it("does not recompute edges for scene-description-only changes", () => {
    const { locId, charId } = setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    const nodeId = getStoryImageNodeId();

    useFlowStore.getState().setStoryImageLocationId({
      nodeId,
      locationId: locId,
    });
    useFlowStore.getState().setStoryImageCharacterIds({
      nodeId,
      characterIds: [charId],
    });
    const edgesBefore = useFlowStore.getState().edges;

    useFlowStore.getState().setStoryImageSceneDescription({
      nodeId,
      sceneDescription: "Updated scene text",
    });
    const edgesAfter = useFlowStore.getState().edges;

    expect(edgesAfter).toBe(edgesBefore);
  });
});

describe("computeEdges - story image", () => {
  it("creates edges from selected location to story image", () => {
    const { locId } = setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    const siId = getStoryImageNodeId();

    useFlowStore.getState().setStoryImageLocationId({
      nodeId: siId,
      locationId: locId,
    });

    const { edges } = useFlowStore.getState();
    const locToSi = edges.find((e) => e.source === locId && e.target === siId);
    expect(locToSi).toBeDefined();
  });

  it("creates edges from selected characters to story image", () => {
    const { charId } = setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    const siId = getStoryImageNodeId();

    useFlowStore.getState().setStoryImageCharacterIds({
      nodeId: siId,
      characterIds: [charId],
    });

    const { edges } = useFlowStore.getState();
    const charToSi = edges.find(
      (e) => e.source === charId && e.target === siId
    );
    expect(charToSi).toBeDefined();
  });

  it("creates sequential edge chain between story image nodes", () => {
    setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    useFlowStore.getState().addStoryImageNode();

    const storyNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "storyImage");
    expect(storyNodes).toHaveLength(2);

    const { edges } = useFlowStore.getState();
    const sequentialEdge = edges.find(
      (e) => e.source === storyNodes[0].id && e.target === storyNodes[1].id
    );
    expect(sequentialEdge).toBeDefined();
    expect(sequentialEdge?.sourceHandle).toBe(
      STORY_IMAGE_RIGHT_SOURCE_HANDLE_ID
    );
    expect(sequentialEdge?.targetHandle).toBe(
      STORY_IMAGE_LEFT_TARGET_HANDLE_ID
    );
  });

  it("edges update when story image is removed", () => {
    setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    const siId = getStoryImageNodeId();

    useFlowStore.getState().removeStoryImageNode({ nodeId: siId });

    const { edges } = useFlowStore.getState();
    const storyEdges = edges.filter(
      (e) => e.source === siId || e.target === siId
    );
    expect(storyEdges).toHaveLength(0);
  });
});

function setupCompletedStoryImage() {
  const { locId, charId } = setupCompletedLocationAndCharacter();
  useFlowStore.getState().addStoryImageNode();
  const siId = getStoryImageNodeId();
  useFlowStore.getState().setStoryImageLocationId({
    nodeId: siId,
    locationId: locId,
  });
  useFlowStore.getState().setStoryImageCharacterIds({
    nodeId: siId,
    characterIds: [charId],
  });
  useFlowStore.getState().setStoryImageSceneDescription({
    nodeId: siId,
    sceneDescription: "A battle scene",
  });
  useFlowStore.getState().setStoryImageGeneratedImage({
    nodeId: siId,
    image: "story-base64",
  });
  return { locId, charId, siId };
}

function getMovieNodeId(): string {
  const node = useFlowStore.getState().nodes.find((n) => n.type === "movie");
  if (!node) {
    throw new Error("No movie node found");
  }
  return node.id;
}

function getComicStripNodeId(): string {
  const node = useFlowStore
    .getState()
    .nodes.find((n) => n.type === "comicStrip");
  if (!node) {
    throw new Error("No comic strip node found");
  }
  return node.id;
}

describe("store - canAddMovie", () => {
  it("returns false when no completed story image exists", () => {
    expect(useFlowStore.getState().canAddMovie()).toBe(false);
  });

  it("returns false when story images exist but none are completed", () => {
    setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    expect(useFlowStore.getState().canAddMovie()).toBe(false);
  });

  it("returns true when at least one completed story image exists", () => {
    setupCompletedStoryImage();
    expect(useFlowStore.getState().canAddMovie()).toBe(true);
  });

  it("returns false when movie already exists", () => {
    setupCompletedStoryImage();
    useFlowStore.getState().addMovieNode();
    expect(useFlowStore.getState().canAddMovie()).toBe(false);
  });
});

describe("store - canAddComicStrip", () => {
  it("returns false when no completed story image exists", () => {
    expect(useFlowStore.getState().canAddComicStrip()).toBe(false);
  });

  it("returns false when story images exist but none are completed", () => {
    setupCompletedLocationAndCharacter();
    useFlowStore.getState().addStoryImageNode();
    expect(useFlowStore.getState().canAddComicStrip()).toBe(false);
  });

  it("returns true when at least one completed story image exists", () => {
    setupCompletedStoryImage();
    expect(useFlowStore.getState().canAddComicStrip()).toBe(true);
  });

  it("returns false when comic strip already exists", () => {
    setupCompletedStoryImage();
    useFlowStore.getState().addComicStripNode();
    expect(useFlowStore.getState().canAddComicStrip()).toBe(false);
  });
});

describe("store - movie nodes", () => {
  it("starts with no movie nodes", () => {
    const movieNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "movie");
    expect(movieNodes).toHaveLength(0);
  });

  it("cannot add movie without preconditions", () => {
    useFlowStore.getState().addMovieNode();
    const movieNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "movie");
    expect(movieNodes).toHaveLength(0);
  });

  it("adds a movie node when preconditions are met", () => {
    setupCompletedStoryImage();
    useFlowStore.getState().addMovieNode();
    const movieNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "movie");
    expect(movieNodes).toHaveLength(1);
    expect(movieNodes[0].data).toEqual({
      error: null,
      generatedVideoUrl: null,
      isGenerating: false,
      phase: "idle",
    });
  });

  it("enforces max movie constraint", () => {
    setupCompletedStoryImage();
    useFlowStore.getState().addMovieNode();
    useFlowStore.getState().addMovieNode();
    const movieNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "movie");
    expect(movieNodes).toHaveLength(MAX_MOVIE_NODES);
  });

  it("removes a movie node", () => {
    setupCompletedStoryImage();
    useFlowStore.getState().addMovieNode();
    const nodeId = getMovieNodeId();

    useFlowStore.getState().removeMovieNode({ nodeId });
    const movieNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "movie");
    expect(movieNodes).toHaveLength(0);
  });

  it("getMovieCount returns correct count", () => {
    setupCompletedStoryImage();
    expect(useFlowStore.getState().getMovieCount()).toBe(0);
    useFlowStore.getState().addMovieNode();
    expect(useFlowStore.getState().getMovieCount()).toBe(1);
  });
});

describe("store - comic strip nodes", () => {
  it("starts with no comic strip nodes", () => {
    const comicStripNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "comicStrip");
    expect(comicStripNodes).toHaveLength(0);
  });

  it("cannot add comic strip without preconditions", () => {
    useFlowStore.getState().addComicStripNode();
    const comicStripNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "comicStrip");
    expect(comicStripNodes).toHaveLength(0);
  });

  it("adds a comic strip node when preconditions are met", () => {
    setupCompletedStoryImage();
    useFlowStore.getState().addComicStripNode();
    const comicStripNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "comicStrip");
    expect(comicStripNodes).toHaveLength(1);
    expect(comicStripNodes[0].data).toEqual({
      generatedPdfUrl: null,
      generatedPngUrl: null,
      isGenerating: false,
    });
  });

  it("enforces max comic strip constraint", () => {
    setupCompletedStoryImage();
    useFlowStore.getState().addComicStripNode();
    useFlowStore.getState().addComicStripNode();
    const comicStripNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "comicStrip");
    expect(comicStripNodes).toHaveLength(MAX_COMIC_STRIP_NODES);
  });

  it("removes a comic strip node", () => {
    setupCompletedStoryImage();
    useFlowStore.getState().addComicStripNode();
    const nodeId = getComicStripNodeId();

    useFlowStore.getState().removeComicStripNode({ nodeId });
    const comicStripNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "comicStrip");
    expect(comicStripNodes).toHaveLength(0);
  });

  it("getComicStripCount returns correct count", () => {
    setupCompletedStoryImage();
    expect(useFlowStore.getState().getComicStripCount()).toBe(0);
    useFlowStore.getState().addComicStripNode();
    expect(useFlowStore.getState().getComicStripCount()).toBe(1);
  });
});

describe("computeEdges - movie", () => {
  it("creates edges from all story images to movie node", () => {
    setupCompletedStoryImage();
    useFlowStore.getState().addMovieNode();

    const storyNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "storyImage");
    const { edges } = useFlowStore.getState();

    for (const siNode of storyNodes) {
      const edge = edges.find(
        (e) => e.source === siNode.id && e.target === "movie"
      );
      expect(edge).toBeDefined();
    }
  });

  it("edges update when movie is removed", () => {
    setupCompletedStoryImage();
    useFlowStore.getState().addMovieNode();
    useFlowStore.getState().removeMovieNode({ nodeId: "movie" });

    const { edges } = useFlowStore.getState();
    const movieEdges = edges.filter(
      (e) => e.source === "movie" || e.target === "movie"
    );
    expect(movieEdges).toHaveLength(0);
  });
});

describe("computeEdges - comic strip", () => {
  it("creates edges from all story images to comic strip node", () => {
    setupCompletedStoryImage();
    useFlowStore.getState().addComicStripNode();

    const storyNodes = useFlowStore
      .getState()
      .nodes.filter((n) => n.type === "storyImage");
    const comicNodeId = getComicStripNodeId();
    const { edges } = useFlowStore.getState();

    for (const siNode of storyNodes) {
      const edge = edges.find(
        (e) => e.source === siNode.id && e.target === comicNodeId
      );
      expect(edge).toBeDefined();
    }
  });

  it("edges update when comic strip is removed", () => {
    setupCompletedStoryImage();
    useFlowStore.getState().addComicStripNode();
    const comicNodeId = getComicStripNodeId();
    useFlowStore.getState().removeComicStripNode({ nodeId: comicNodeId });

    const { edges } = useFlowStore.getState();
    const comicEdges = edges.filter(
      (e) => e.source === comicNodeId || e.target === comicNodeId
    );
    expect(comicEdges).toHaveLength(0);
  });
});

describe("store - model selection", () => {
  it("has correct default image model", () => {
    const { globalSettings } = useFlowStore.getState();
    expect(globalSettings.imageModel).toBe("google/gemini-3-pro-image");
  });

  it("has correct default video model", () => {
    const { globalSettings } = useFlowStore.getState();
    expect(globalSettings.videoModel).toBe("google/veo-3.1-generate-001");
  });

  it("updates image model", () => {
    useFlowStore.getState().setImageModel({
      model: "google/gemini-3.1.flash-image-preview",
    });
    const { globalSettings } = useFlowStore.getState();
    expect(globalSettings.imageModel).toBe(
      "google/gemini-3.1.flash-image-preview"
    );
  });

  it("updates video model", () => {
    useFlowStore.getState().setVideoModel({
      model: "klingai/kling-v3.0-i2v",
    });
    const { globalSettings } = useFlowStore.getState();
    expect(globalSettings.videoModel).toBe("klingai/kling-v3.0-i2v");
  });

  it("preserves image model when video model changes", () => {
    useFlowStore.getState().setImageModel({
      model: "google/gemini-3.1.flash-image-preview",
    });
    useFlowStore.getState().setVideoModel({
      model: "xai/grok-imagine-video",
    });
    const { globalSettings } = useFlowStore.getState();
    expect(globalSettings.imageModel).toBe(
      "google/gemini-3.1.flash-image-preview"
    );
    expect(globalSettings.videoModel).toBe("xai/grok-imagine-video");
  });

  it("preserves video model when image model changes", () => {
    useFlowStore.getState().setVideoModel({
      model: "google/veo-3.0-generate-001",
    });
    useFlowStore.getState().setImageModel({
      model: "google/gemini-3.1.flash-image-preview",
    });
    const { globalSettings } = useFlowStore.getState();
    expect(globalSettings.videoModel).toBe("google/veo-3.0-generate-001");
    expect(globalSettings.imageModel).toBe(
      "google/gemini-3.1.flash-image-preview"
    );
  });
});
