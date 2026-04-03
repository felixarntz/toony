import { beforeEach, describe, expect, it } from "vitest";
import { MAX_CHARACTER_NODES, MAX_LOCATION_NODES, useFlowStore } from "./store";

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
      description: "",
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
      description: "",
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
