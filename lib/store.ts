import type { Edge, OnNodesChange } from "@xyflow/react";
import { applyNodeChanges, MarkerType } from "@xyflow/react";
import { create } from "zustand";
import type {
  AppNode,
  CharacterNodeData,
  LocationNodeData,
  SettingNodeData,
  StyleNodeData,
  StylePreset,
} from "@/lib/types";

const MAX_LOCATION_NODES = 2;
const MAX_CHARACTER_NODES = 3;

interface GlobalSettings {
  imageModel: string;
  videoModel: string;
}

interface FlowState {
  addCharacterNode: () => void;
  addLocationNode: () => void;
  edges: Edge[];
  getCharacterCount: () => number;
  getLocationCount: () => number;
  globalSettings: GlobalSettings;
  nodes: AppNode[];
  onNodesChange: OnNodesChange<AppNode>;
  removeCharacterNode: (opts: { nodeId: string }) => void;
  removeLocationNode: (opts: { nodeId: string }) => void;
  setCharacterDescription: (opts: {
    nodeId: string;
    description: string;
  }) => void;
  setCharacterImages: (opts: {
    nodeId: string;
    frontalImage: string | null;
    sideImage: string | null;
  }) => void;
  setCharacterIsGenerating: (opts: {
    nodeId: string;
    isGenerating: boolean;
  }) => void;
  setCustomStyleDescription: (opts: { description: string }) => void;
  setLocationDescription: (opts: {
    nodeId: string;
    description: string;
  }) => void;
  setLocationGeneratedImage: (opts: {
    nodeId: string;
    image: string | null;
  }) => void;
  setLocationIsGenerating: (opts: {
    nodeId: string;
    isGenerating: boolean;
  }) => void;
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

function updateLocationNode(opts: {
  nodes: AppNode[];
  nodeId: string;
  updater: (data: LocationNodeData) => LocationNodeData;
}): AppNode[] {
  return opts.nodes.map((node) => {
    if (node.type === "location" && node.id === opts.nodeId) {
      return { ...node, data: opts.updater(node.data as LocationNodeData) };
    }
    return node;
  });
}

function updateCharacterNode(opts: {
  nodes: AppNode[];
  nodeId: string;
  updater: (data: CharacterNodeData) => CharacterNodeData;
}): AppNode[] {
  return opts.nodes.map((node) => {
    if (node.type === "character" && node.id === opts.nodeId) {
      return { ...node, data: opts.updater(node.data as CharacterNodeData) };
    }
    return node;
  });
}

function setNodesWithEdges(
  nodes: AppNode[]
): Pick<FlowState, "edges" | "nodes"> {
  return { nodes, edges: computeEdges(nodes) };
}

let locationCounter = 0;
let characterCounter = 0; // biome-ignore lint: must be mutable

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: initialNodes,
  edges: computeEdges(initialNodes),
  globalSettings: {
    imageModel: "google/gemini-3-pro-image",
    videoModel: "google/veo-3.1-generate-001",
  },
  getLocationCount: () =>
    get().nodes.filter((n) => n.type === "location").length,
  getCharacterCount: () =>
    get().nodes.filter((n) => n.type === "character").length,
  onNodesChange: (changes) =>
    set(setNodesWithEdges(applyNodeChanges(changes, get().nodes))),
  addLocationNode: () => {
    const { nodes } = get();
    const locationCount = nodes.filter((n) => n.type === "location").length;
    if (locationCount >= MAX_LOCATION_NODES) {
      return;
    }
    locationCounter++;
    const newNode: AppNode = {
      id: `location-${locationCounter}`,
      type: "location",
      position: { x: 100 + locationCount * 400, y: 300 },
      data: {
        description: "",
        generatedImage: null,
        isGenerating: false,
      },
    };
    set(setNodesWithEdges([...nodes, newNode]));
  },
  removeLocationNode: ({ nodeId }) => {
    const { nodes } = get();
    const filtered = nodes.filter((n) => n.id !== nodeId);
    set(setNodesWithEdges(filtered));
  },
  addCharacterNode: () => {
    const { nodes } = get();
    const characterCount = nodes.filter((n) => n.type === "character").length;
    if (characterCount >= MAX_CHARACTER_NODES) {
      return;
    }
    characterCounter++;
    const newNode: AppNode = {
      id: `character-${characterCounter}`,
      type: "character",
      position: { x: 100 + characterCount * 400, y: 550 },
      data: {
        description: "",
        frontalImage: null,
        sideImage: null,
        isGenerating: false,
      },
    };
    set(setNodesWithEdges([...nodes, newNode]));
  },
  removeCharacterNode: ({ nodeId }) => {
    const { nodes } = get();
    const filtered = nodes.filter((n) => n.id !== nodeId);
    set(setNodesWithEdges(filtered));
  },
  setCharacterDescription: ({ nodeId, description }) =>
    set(
      setNodesWithEdges(
        updateCharacterNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, description }),
        })
      )
    ),
  setCharacterImages: ({ nodeId, frontalImage, sideImage }) =>
    set(
      setNodesWithEdges(
        updateCharacterNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, frontalImage, sideImage }),
        })
      )
    ),
  setCharacterIsGenerating: ({ nodeId, isGenerating }) =>
    set(
      setNodesWithEdges(
        updateCharacterNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, isGenerating }),
        })
      )
    ),
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
  setLocationDescription: ({ nodeId, description }) =>
    set(
      setNodesWithEdges(
        updateLocationNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, description }),
        })
      )
    ),
  setLocationGeneratedImage: ({ nodeId, image }) =>
    set(
      setNodesWithEdges(
        updateLocationNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, generatedImage: image }),
        })
      )
    ),
  setLocationIsGenerating: ({ nodeId, isGenerating }) =>
    set(
      setNodesWithEdges(
        updateLocationNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, isGenerating }),
        })
      )
    ),
}));

export { computeEdges, MAX_CHARACTER_NODES, MAX_LOCATION_NODES };

if ((import.meta as unknown as Record<string, unknown>).hot) {
  const hot = (import.meta as unknown as Record<string, unknown>).hot as {
    dispose: (cb: (data: Record<string, unknown>) => void) => void;
    data?: Record<string, unknown>;
  };
  hot.dispose((data: Record<string, unknown>) => {
    data.storeState = useFlowStore.getState();
    data.locationCounter = locationCounter;
    data.characterCounter = characterCounter;
  });
  if (hot.data?.storeState) {
    useFlowStore.setState(hot.data.storeState as FlowState);
    locationCounter = (hot.data.locationCounter as number) ?? 0;
    characterCounter = (hot.data.characterCounter as number) ?? 0;
  }
}
