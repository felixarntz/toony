import { beforeEach, describe, expect, it } from "vitest";
import { STYLE_PRESET_DESCRIPTIONS } from "@/lib/constants";
import { computeEdges, useFlowStore } from "@/lib/store";
import type { SettingNodeData, StyleNodeData, StylePreset } from "@/lib/types";

describe("useFlowStore", () => {
  beforeEach(() => {
    useFlowStore.setState(useFlowStore.getInitialState());
  });

  it("has initial nodes for style and setting", () => {
    const { nodes } = useFlowStore.getState();
    expect(nodes).toHaveLength(2);

    const styleNode = nodes.find((n) => n.id === "style");
    expect(styleNode).toBeDefined();
    expect(styleNode?.type).toBe("style");
    expect(styleNode?.data).toEqual({
      preset: "ghibli-anime",
      customDescription: "",
    });

    const settingNode = nodes.find((n) => n.id === "setting");
    expect(settingNode).toBeDefined();
    expect(settingNode?.type).toBe("setting");
    expect(settingNode?.data).toEqual({ description: "" });
  });

  it("has initial global settings", () => {
    const { globalSettings } = useFlowStore.getState();
    expect(globalSettings.imageModel).toBe("google/gemini-3-pro-image");
    expect(globalSettings.videoModel).toBe("google/veo-3.1-generate-001");
  });

  it("updates style preset", () => {
    useFlowStore.getState().setStylePreset({ preset: "pixar-3d" });
    const styleNode = useFlowStore
      .getState()
      .nodes.find((n) => n.id === "style");
    const data = styleNode?.data as StyleNodeData;
    expect(data.preset).toBe("pixar-3d");
  });

  it("updates custom style description", () => {
    useFlowStore
      .getState()
      .setCustomStyleDescription({ description: "A dreamy pastel world" });
    const styleNode = useFlowStore
      .getState()
      .nodes.find((n) => n.id === "style");
    const data = styleNode?.data as StyleNodeData;
    expect(data.customDescription).toBe("A dreamy pastel world");
  });

  it("updates setting description", () => {
    useFlowStore
      .getState()
      .setSettingDescription({ description: "Post-apocalyptic Tokyo" });
    const settingNode = useFlowStore
      .getState()
      .nodes.find((n) => n.id === "setting");
    const data = settingNode?.data as SettingNodeData;
    expect(data.description).toBe("Post-apocalyptic Tokyo");
  });

  it("has descriptions for all non-custom presets", () => {
    const presetKeys = Object.keys(STYLE_PRESET_DESCRIPTIONS);
    expect(presetKeys).toHaveLength(13);
    for (const key of presetKeys) {
      expect(
        STYLE_PRESET_DESCRIPTIONS[key as Exclude<StylePreset, "custom">]
      ).toBeTruthy();
    }
  });

  it("stores edges in state that update with nodes", () => {
    const { edges } = useFlowStore.getState();
    expect(edges).toHaveLength(0);
  });
});

describe("computeEdges", () => {
  beforeEach(() => {
    useFlowStore.setState(useFlowStore.getInitialState());
  });

  it("returns no edges when only style and setting exist", () => {
    const { nodes } = useFlowStore.getState();
    const edges = computeEdges(nodes);
    expect(edges).toHaveLength(0);
  });

  it("computes edges from style and setting to downstream nodes", () => {
    const state = useFlowStore.getState();
    const nodes = [
      ...state.nodes,
      {
        id: "location-1" as const,
        type: "style" as const,
        position: { x: 0, y: 300 },
        data: { preset: "ghibli-anime" as const, customDescription: "" },
      },
    ];

    const edges = computeEdges(nodes);
    expect(edges).toHaveLength(2);

    const styleEdge = edges.find((e) => e.source === "style");
    expect(styleEdge?.target).toBe("location-1");

    const settingEdge = edges.find((e) => e.source === "setting");
    expect(settingEdge?.target).toBe("location-1");
  });

  it("creates edges to multiple downstream nodes", () => {
    const state = useFlowStore.getState();
    const nodes = [
      ...state.nodes,
      {
        id: "location-1" as const,
        type: "style" as const,
        position: { x: 0, y: 300 },
        data: { preset: "ghibli-anime" as const, customDescription: "" },
      },
      {
        id: "character-1" as const,
        type: "style" as const,
        position: { x: 300, y: 300 },
        data: { preset: "ghibli-anime" as const, customDescription: "" },
      },
    ];

    const edges = computeEdges(nodes);
    expect(edges).toHaveLength(4);
  });
});
