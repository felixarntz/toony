import { beforeEach, describe, expect, it } from "vitest";
import { MAX_LOCATION_NODES, useFlowStore } from "./store";

function getLocationNodeId(): string {
  const node = useFlowStore.getState().nodes.find((n) => n.type === "location");
  if (!node) {
    throw new Error("No location node found");
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
});
