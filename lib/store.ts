import type { Edge, OnNodesChange } from "@xyflow/react";
import { applyNodeChanges, MarkerType } from "@xyflow/react";
import { create } from "zustand";
import type {
  AppNode,
  SettingNodeData,
  StyleNodeData,
  StylePreset,
} from "@/lib/types";

interface GlobalSettings {
  imageModel: string;
  videoModel: string;
}

interface FlowState {
  edges: Edge[];
  globalSettings: GlobalSettings;
  nodes: AppNode[];
  onNodesChange: OnNodesChange<AppNode>;
  setCustomStyleDescription: (opts: { description: string }) => void;
  setSettingDescription: (opts: { description: string }) => void;
  setStylePreset: (opts: { preset: StylePreset }) => void;
}

const initialNodes: AppNode[] = [
  {
    id: "style",
    type: "style",
    position: { x: 100, y: 50 },
    data: { preset: "ghibli-anime", customDescription: "" },
  },
  {
    id: "setting",
    type: "setting",
    position: { x: 500, y: 50 },
    data: { description: "" },
  },
];

function computeEdges(nodes: AppNode[]): Edge[] {
  const nodeIds = nodes.map((n) => n.id);
  const downstreamIds = nodeIds.filter(
    (id) => id !== "style" && id !== "setting"
  );

  const edges: Edge[] = [];
  for (const sourceId of ["style", "setting"]) {
    if (!nodeIds.includes(sourceId)) {
      continue;
    }
    for (const targetId of downstreamIds) {
      edges.push({
        id: `${sourceId}->${targetId}`,
        source: sourceId,
        target: targetId,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#666" },
        style: { stroke: "#666" },
      });
    }
  }

  return edges;
}

function updateStyleNode(
  nodes: AppNode[],
  updater: (data: StyleNodeData) => StyleNodeData
): AppNode[] {
  return nodes.map((node) => {
    if (node.type === "style") {
      return { ...node, data: updater(node.data as StyleNodeData) };
    }
    return node;
  });
}

function updateSettingNode(
  nodes: AppNode[],
  updater: (data: SettingNodeData) => SettingNodeData
): AppNode[] {
  return nodes.map((node) => {
    if (node.type === "setting") {
      return { ...node, data: updater(node.data as SettingNodeData) };
    }
    return node;
  });
}

function setNodesWithEdges(
  nodes: AppNode[]
): Pick<FlowState, "edges" | "nodes"> {
  return { nodes, edges: computeEdges(nodes) };
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: initialNodes,
  edges: computeEdges(initialNodes),
  globalSettings: {
    imageModel: "google/gemini-3-pro-image",
    videoModel: "google/veo-3.1-generate-001",
  },
  onNodesChange: (changes) =>
    set(setNodesWithEdges(applyNodeChanges(changes, get().nodes))),
  setStylePreset: ({ preset }) =>
    set(
      setNodesWithEdges(updateStyleNode(get().nodes, (d) => ({ ...d, preset })))
    ),
  setCustomStyleDescription: ({ description }) =>
    set(
      setNodesWithEdges(
        updateStyleNode(get().nodes, (d) => ({
          ...d,
          customDescription: description,
        }))
      )
    ),
  setSettingDescription: ({ description }) =>
    set(
      setNodesWithEdges(
        updateSettingNode(get().nodes, (d) => ({ ...d, description }))
      )
    ),
}));

export { computeEdges };
