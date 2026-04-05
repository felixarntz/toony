import type { Edge, OnNodesChange } from "@xyflow/react";
import { applyNodeChanges, MarkerType } from "@xyflow/react";
import { create } from "zustand";
import {
  STORY_IMAGE_BOTTOM_SOURCE_HANDLE_ID,
  STORY_IMAGE_LEFT_TARGET_HANDLE_ID,
  STORY_IMAGE_RIGHT_SOURCE_HANDLE_ID,
  STORY_IMAGE_TOP_TARGET_HANDLE_ID,
} from "@/lib/edge-handles";
import { computeLayoutPositions, resolveOverlap } from "@/lib/layout";
import type {
  AppNode,
  CharacterNodeData,
  ComicStripNodeData,
  LocationNodeData,
  MovieNodeData,
  SettingNodeData,
  StoryImageNodeData,
  StyleNodeData,
  StylePreset,
} from "@/lib/types";

const MAX_LOCATION_NODES = 2;
const MAX_CHARACTER_NODES = 3;
const MAX_STORY_IMAGE_NODES = 6;
const MAX_MOVIE_NODES = 1;
const MAX_COMIC_STRIP_NODES = 1;

interface GlobalSettings {
  imageModel: string;
  videoModel: string;
}

interface FlowState {
  addCharacterNode: () => void;
  addComicStripNode: () => void;
  addLocationNode: () => void;
  addMovieNode: () => void;
  addStoryImageNode: () => void;
  canAddComicStrip: () => boolean;
  canAddMovie: () => boolean;
  canAddStoryImage: () => boolean;
  edges: Edge[];
  getCharacterCount: () => number;
  getComicStripCount: () => number;
  getLocationCount: () => number;
  getMovieCount: () => number;
  getStoryImageCount: () => number;
  globalSettings: GlobalSettings;
  nodes: AppNode[];
  onNodesChange: OnNodesChange<AppNode>;
  removeCharacterNode: (opts: { nodeId: string }) => void;
  removeComicStripNode: (opts: { nodeId: string }) => void;
  removeLocationNode: (opts: { nodeId: string }) => void;
  removeMovieNode: (opts: { nodeId: string }) => void;
  removeStoryImageNode: (opts: { nodeId: string }) => void;
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
  setCharacterName: (opts: { nodeId: string; name: string }) => void;
  setComicStripGeneratedPdfUrl: (opts: {
    nodeId: string;
    url: string | null;
  }) => void;
  setComicStripGeneratedPngUrl: (opts: {
    nodeId: string;
    url: string | null;
  }) => void;
  setComicStripIsGenerating: (opts: {
    nodeId: string;
    isGenerating: boolean;
  }) => void;
  setCustomStyleDescription: (opts: { description: string }) => void;
  setImageModel: (opts: { model: string }) => void;
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
  setLocationName: (opts: { nodeId: string; name: string }) => void;
  setMovieGeneratedVideoUrl: (opts: {
    nodeId: string;
    url: string | null;
  }) => void;
  setMovieIsGenerating: (opts: {
    nodeId: string;
    isGenerating: boolean;
  }) => void;
  setMoviePhase: (opts: {
    nodeId: string;
    phase: MovieNodeData["phase"];
  }) => void;
  setSettingDescription: (opts: { description: string }) => void;
  setStoryImageCharacterIds: (opts: {
    nodeId: string;
    characterIds: string[];
  }) => void;
  setStoryImageGeneratedImage: (opts: {
    nodeId: string;
    image: string | null;
  }) => void;
  setStoryImageIsGenerating: (opts: {
    nodeId: string;
    isGenerating: boolean;
  }) => void;
  setStoryImageLocationId: (opts: {
    nodeId: string;
    locationId: string | null;
  }) => void;
  setStoryImageSceneDescription: (opts: {
    nodeId: string;
    sceneDescription: string;
  }) => void;
  setStylePreset: (opts: { preset: StylePreset }) => void;
  setVideoModel: (opts: { model: string }) => void;
}

function applyLayoutPositions(opts: { nodes: AppNode[] }): AppNode[] {
  const positions = computeLayoutPositions({ nodes: opts.nodes });
  return opts.nodes.map((node) => {
    const pos = positions.get(node.id);
    if (pos) {
      return { ...node, position: pos };
    }
    return node;
  });
}

const baseInitialNodes: AppNode[] = [
  {
    id: "style",
    type: "style",
    position: { x: 0, y: 0 },
    data: { preset: "ghibli-anime", customDescription: "" },
  },
  {
    id: "setting",
    type: "setting",
    position: { x: 0, y: 0 },
    data: { description: "" },
  },
];

const initialNodes: AppNode[] = applyLayoutPositions({
  nodes: baseInitialNodes,
});

function computeEdges(nodes: AppNode[]): Edge[] {
  const nodeById = new Map(nodes.map((n) => [n.id, n] as const));
  const nodeIds = nodes.map((n) => n.id);
  const downstreamIds = nodeIds.filter(
    (id) => id !== "style" && id !== "setting"
  );

  const edges: Edge[] = [];
  const makeMarker = (color: string) => ({
    type: MarkerType.ArrowClosed,
    color,
    width: 20,
    height: 20,
  });
  const defaultColor = "#666";
  const edgeStyle = { stroke: defaultColor };
  const markerEnd = makeMarker(defaultColor);

  for (const sourceId of ["style", "setting"]) {
    if (!nodeIds.includes(sourceId)) {
      continue;
    }
    for (const targetId of downstreamIds) {
      const targetNode = nodeById.get(targetId);
      edges.push({
        id: `${sourceId}->${targetId}`,
        source: sourceId,
        target: targetId,
        targetHandle:
          targetNode?.type === "storyImage"
            ? STORY_IMAGE_TOP_TARGET_HANDLE_ID
            : undefined,
        markerEnd,
        style: edgeStyle,
      });
    }
  }

  const storyImageNodes = nodes.filter((n) => n.type === "storyImage");

  for (const siNode of storyImageNodes) {
    const siData = siNode.data as StoryImageNodeData;

    if (siData.locationId && nodeIds.includes(siData.locationId)) {
      edges.push({
        id: `${siData.locationId}->${siNode.id}`,
        source: siData.locationId,
        target: siNode.id,
        targetHandle: STORY_IMAGE_TOP_TARGET_HANDLE_ID,
        markerEnd: makeMarker("#f59e0b"),
        style: { stroke: "#f59e0b" },
      });
    }

    for (const charId of siData.characterIds) {
      if (nodeIds.includes(charId)) {
        edges.push({
          id: `${charId}->${siNode.id}`,
          source: charId,
          target: siNode.id,
          targetHandle: STORY_IMAGE_TOP_TARGET_HANDLE_ID,
          markerEnd: makeMarker("#14b8a6"),
          style: { stroke: "#14b8a6" },
        });
      }
    }
  }

  for (let i = 0; i < storyImageNodes.length - 1; i++) {
    edges.push({
      id: `${storyImageNodes[i].id}->${storyImageNodes[i + 1].id}`,
      source: storyImageNodes[i].id,
      target: storyImageNodes[i + 1].id,
      sourceHandle: STORY_IMAGE_RIGHT_SOURCE_HANDLE_ID,
      targetHandle: STORY_IMAGE_LEFT_TARGET_HANDLE_ID,
      markerEnd: makeMarker("#a855f7"),
      style: { stroke: "#a855f7" },
    });
  }

  const addTerminalNodeEdges = (opts: {
    color: string;
    targetNode: AppNode | undefined;
  }): void => {
    if (!opts.targetNode) {
      return;
    }
    for (const siNode of storyImageNodes) {
      edges.push({
        id: `${siNode.id}->${opts.targetNode.id}`,
        source: siNode.id,
        target: opts.targetNode.id,
        sourceHandle: STORY_IMAGE_BOTTOM_SOURCE_HANDLE_ID,
        markerEnd: makeMarker(opts.color),
        style: { stroke: opts.color },
      });
    }
  };

  addTerminalNodeEdges({
    targetNode: nodes.find((n) => n.type === "movie"),
    color: "#ec4899",
  });
  addTerminalNodeEdges({
    targetNode: nodes.find((n) => n.type === "comicStrip"),
    color: "#22d3ee",
  });

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

function updateStoryImageNode(opts: {
  nodes: AppNode[];
  nodeId: string;
  updater: (data: StoryImageNodeData) => StoryImageNodeData;
}): AppNode[] {
  return opts.nodes.map((node) => {
    if (node.type === "storyImage" && node.id === opts.nodeId) {
      return {
        ...node,
        data: opts.updater(node.data as StoryImageNodeData),
      };
    }
    return node;
  });
}

function updateMovieNode(opts: {
  nodes: AppNode[];
  nodeId: string;
  updater: (data: MovieNodeData) => MovieNodeData;
}): AppNode[] {
  return opts.nodes.map((node) => {
    if (node.type === "movie" && node.id === opts.nodeId) {
      return { ...node, data: opts.updater(node.data as MovieNodeData) };
    }
    return node;
  });
}

function updateComicStripNode(opts: {
  nodes: AppNode[];
  nodeId: string;
  updater: (data: ComicStripNodeData) => ComicStripNodeData;
}): AppNode[] {
  return opts.nodes.map((node) => {
    if (node.type === "comicStrip" && node.id === opts.nodeId) {
      return { ...node, data: opts.updater(node.data as ComicStripNodeData) };
    }
    return node;
  });
}

function setNodesWithEdges(
  nodes: AppNode[]
): Pick<FlowState, "edges" | "nodes"> {
  return { nodes, edges: computeEdges(nodes) };
}

function setNodesOnly(nodes: AppNode[]): Pick<FlowState, "nodes"> {
  return { nodes };
}

let locationCounter = 0;
let characterCounter = 0;
let storyImageCounter = 0;
let comicStripCounter = 0;

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
  getStoryImageCount: () =>
    get().nodes.filter((n) => n.type === "storyImage").length,
  getMovieCount: () => get().nodes.filter((n) => n.type === "movie").length,
  getComicStripCount: () =>
    get().nodes.filter((n) => n.type === "comicStrip").length,
  canAddComicStrip: () => {
    const { nodes } = get();
    const hasCompletedStoryImage = nodes.some(
      (n) =>
        n.type === "storyImage" &&
        (n.data as StoryImageNodeData).generatedImage !== null
    );
    const comicStripCount = nodes.filter((n) => n.type === "comicStrip").length;
    return hasCompletedStoryImage && comicStripCount < MAX_COMIC_STRIP_NODES;
  },
  canAddMovie: () => {
    const { nodes } = get();
    const hasCompletedStoryImage = nodes.some(
      (n) =>
        n.type === "storyImage" &&
        (n.data as StoryImageNodeData).generatedImage !== null
    );
    const movieCount = nodes.filter((n) => n.type === "movie").length;
    return hasCompletedStoryImage && movieCount < MAX_MOVIE_NODES;
  },
  canAddStoryImage: () => {
    const { nodes } = get();
    const hasCompletedLocation = nodes.some(
      (n) =>
        n.type === "location" &&
        (n.data as LocationNodeData).generatedImage !== null
    );
    const hasCompletedCharacter = nodes.some(
      (n) =>
        n.type === "character" &&
        (n.data as CharacterNodeData).frontalImage !== null &&
        (n.data as CharacterNodeData).sideImage !== null
    );
    const storyImageCount = nodes.filter((n) => n.type === "storyImage").length;
    return (
      hasCompletedLocation &&
      hasCompletedCharacter &&
      storyImageCount < MAX_STORY_IMAGE_NODES
    );
  },
  setImageModel: ({ model }) =>
    set((state) => ({
      globalSettings: { ...state.globalSettings, imageModel: model },
    })),
  setVideoModel: ({ model }) =>
    set((state) => ({
      globalSettings: { ...state.globalSettings, videoModel: model },
    })),
  onNodesChange: (changes) => {
    let nodes = applyNodeChanges(changes, get().nodes);

    const positionChanges = changes.filter(
      (c): c is Extract<typeof c, { type: "position" }> =>
        c.type === "position" && "dragging" in c && !c.dragging
    );
    if (positionChanges.length > 0) {
      nodes = nodes.map((node) => {
        const wasChanged = positionChanges.some((c) => c.id === node.id);
        if (!wasChanged) {
          return node;
        }
        const newPos = resolveOverlap({ movedNode: node, nodes });
        if (newPos) {
          return { ...node, position: newPos };
        }
        return node;
      });
    }

    set(setNodesWithEdges(nodes));
  },
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
      position: { x: 0, y: 0 },
      data: {
        name: "",
        description: "",
        generatedImage: null,
        isGenerating: false,
      },
    };
    set(
      setNodesWithEdges(applyLayoutPositions({ nodes: [...nodes, newNode] }))
    );
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
      position: { x: 0, y: 0 },
      data: {
        name: "",
        description: "",
        frontalImage: null,
        sideImage: null,
        isGenerating: false,
      },
    };
    set(
      setNodesWithEdges(applyLayoutPositions({ nodes: [...nodes, newNode] }))
    );
  },
  removeCharacterNode: ({ nodeId }) => {
    const { nodes } = get();
    const filtered = nodes.filter((n) => n.id !== nodeId);
    set(setNodesWithEdges(filtered));
  },
  addStoryImageNode: () => {
    const state = get();
    if (!state.canAddStoryImage()) {
      return;
    }
    const completedLocationNodes = state.nodes.filter(
      (n) =>
        n.type === "location" &&
        (n.data as LocationNodeData).generatedImage !== null
    );
    const defaultLocationId =
      completedLocationNodes.length === 1 ? completedLocationNodes[0].id : null;
    storyImageCounter++;
    const newNode: AppNode = {
      id: `storyImage-${storyImageCounter}`,
      type: "storyImage",
      position: { x: 0, y: 0 },
      data: {
        locationId: defaultLocationId,
        characterIds: [],
        sceneDescription: "",
        generatedImage: null,
        isGenerating: false,
      },
    };
    set(
      setNodesWithEdges(
        applyLayoutPositions({ nodes: [...state.nodes, newNode] })
      )
    );
  },
  removeStoryImageNode: ({ nodeId }) => {
    const { nodes } = get();
    const filtered = nodes.filter((n) => n.id !== nodeId);
    set(setNodesWithEdges(filtered));
  },
  addMovieNode: () => {
    const state = get();
    if (!state.canAddMovie()) {
      return;
    }
    const newNode: AppNode = {
      id: "movie",
      type: "movie",
      position: { x: 0, y: 0 },
      data: {
        generatedVideoUrl: null,
        isGenerating: false,
        phase: "idle",
      },
    };
    set(
      setNodesWithEdges(
        applyLayoutPositions({ nodes: [...state.nodes, newNode] })
      )
    );
  },
  addComicStripNode: () => {
    const state = get();
    if (!state.canAddComicStrip()) {
      return;
    }
    comicStripCounter++;
    const newNode: AppNode = {
      id: `comic-strip-${comicStripCounter}`,
      type: "comicStrip",
      position: { x: 0, y: 0 },
      data: {
        generatedPdfUrl: null,
        generatedPngUrl: null,
        isGenerating: false,
      },
    };
    set(
      setNodesWithEdges(
        applyLayoutPositions({ nodes: [...state.nodes, newNode] })
      )
    );
  },
  removeMovieNode: ({ nodeId }) => {
    const { nodes } = get();
    const filtered = nodes.filter((n) => n.id !== nodeId);
    set(setNodesWithEdges(filtered));
  },
  removeComicStripNode: ({ nodeId }) => {
    const { nodes } = get();
    const filtered = nodes.filter((n) => n.id !== nodeId);
    set(setNodesWithEdges(filtered));
  },
  setCharacterDescription: ({ nodeId, description }) =>
    set(
      setNodesOnly(
        updateCharacterNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, description }),
        })
      )
    ),
  setCharacterImages: ({ nodeId, frontalImage, sideImage }) =>
    set(
      setNodesOnly(
        updateCharacterNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, frontalImage, sideImage }),
        })
      )
    ),
  setCharacterIsGenerating: ({ nodeId, isGenerating }) =>
    set(
      setNodesOnly(
        updateCharacterNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, isGenerating }),
        })
      )
    ),
  setCharacterName: ({ nodeId, name }) =>
    set(
      setNodesOnly(
        updateCharacterNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, name }),
        })
      )
    ),
  setMovieGeneratedVideoUrl: ({ nodeId, url }) =>
    set(
      setNodesOnly(
        updateMovieNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, generatedVideoUrl: url }),
        })
      )
    ),
  setMovieIsGenerating: ({ nodeId, isGenerating }) =>
    set(
      setNodesOnly(
        updateMovieNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, isGenerating }),
        })
      )
    ),
  setMoviePhase: ({ nodeId, phase }) =>
    set(
      setNodesOnly(
        updateMovieNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, phase }),
        })
      )
    ),
  setComicStripGeneratedPngUrl: ({ nodeId, url }) =>
    set(
      setNodesOnly(
        updateComicStripNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, generatedPngUrl: url }),
        })
      )
    ),
  setComicStripGeneratedPdfUrl: ({ nodeId, url }) =>
    set(
      setNodesOnly(
        updateComicStripNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, generatedPdfUrl: url }),
        })
      )
    ),
  setComicStripIsGenerating: ({ nodeId, isGenerating }) =>
    set(
      setNodesOnly(
        updateComicStripNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, isGenerating }),
        })
      )
    ),
  setStylePreset: ({ preset }) =>
    set(setNodesOnly(updateStyleNode(get().nodes, (d) => ({ ...d, preset })))),
  setCustomStyleDescription: ({ description }) =>
    set(
      setNodesOnly(
        updateStyleNode(get().nodes, (d) => ({
          ...d,
          customDescription: description,
        }))
      )
    ),
  setSettingDescription: ({ description }) =>
    set(
      setNodesOnly(
        updateSettingNode(get().nodes, (d) => ({ ...d, description }))
      )
    ),
  setLocationDescription: ({ nodeId, description }) =>
    set(
      setNodesOnly(
        updateLocationNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, description }),
        })
      )
    ),
  setLocationGeneratedImage: ({ nodeId, image }) =>
    set(
      setNodesOnly(
        updateLocationNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, generatedImage: image }),
        })
      )
    ),
  setLocationIsGenerating: ({ nodeId, isGenerating }) =>
    set(
      setNodesOnly(
        updateLocationNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, isGenerating }),
        })
      )
    ),
  setLocationName: ({ nodeId, name }) =>
    set(
      setNodesOnly(
        updateLocationNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, name }),
        })
      )
    ),
  setStoryImageLocationId: ({ nodeId, locationId }) =>
    set(
      setNodesWithEdges(
        updateStoryImageNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, locationId }),
        })
      )
    ),
  setStoryImageCharacterIds: ({ nodeId, characterIds }) =>
    set(
      setNodesWithEdges(
        updateStoryImageNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, characterIds }),
        })
      )
    ),
  setStoryImageSceneDescription: ({ nodeId, sceneDescription }) =>
    set(
      setNodesOnly(
        updateStoryImageNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, sceneDescription }),
        })
      )
    ),
  setStoryImageGeneratedImage: ({ nodeId, image }) =>
    set(
      setNodesOnly(
        updateStoryImageNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, generatedImage: image }),
        })
      )
    ),
  setStoryImageIsGenerating: ({ nodeId, isGenerating }) =>
    set(
      setNodesOnly(
        updateStoryImageNode({
          nodes: get().nodes,
          nodeId,
          updater: (d) => ({ ...d, isGenerating }),
        })
      )
    ),
}));

export {
  computeEdges,
  MAX_CHARACTER_NODES,
  MAX_COMIC_STRIP_NODES,
  MAX_LOCATION_NODES,
  MAX_MOVIE_NODES,
  MAX_STORY_IMAGE_NODES,
};

if ((import.meta as unknown as Record<string, unknown>).hot) {
  const hot = (import.meta as unknown as Record<string, unknown>).hot as {
    dispose: (cb: (data: Record<string, unknown>) => void) => void;
    data?: Record<string, unknown>;
  };
  hot.dispose((data: Record<string, unknown>) => {
    data.storeState = useFlowStore.getState();
    data.locationCounter = locationCounter;
    data.characterCounter = characterCounter;
    data.storyImageCounter = storyImageCounter;
    data.comicStripCounter = comicStripCounter;
  });
  if (hot.data?.storeState) {
    useFlowStore.setState(hot.data.storeState as FlowState);
    locationCounter = (hot.data.locationCounter as number) ?? 0;
    characterCounter = (hot.data.characterCounter as number) ?? 0;
    storyImageCounter = (hot.data.storyImageCounter as number) ?? 0;
    comicStripCounter = (hot.data.comicStripCounter as number) ?? 0;
  }
}
