"use client";

import { Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useFlowStore } from "@/lib/store";
import type { AppNode } from "@/lib/types";
import { AuroraBackground } from "./aurora-background";
import { AddNodePanel } from "./controls/add-node-panel";
import { ModelSettingsPanel } from "./controls/model-settings-panel";
import { ProjectPanel } from "./controls/project-panel";
import { CharacterNode } from "./nodes/character-node";
import { ComicStripNode } from "./nodes/comic-strip-node";
import { LocationNode } from "./nodes/location-node";
import { MovieNode } from "./nodes/movie-node";
import { SettingNode } from "./nodes/setting-node";
import { StoryImageNode } from "./nodes/story-image-node";
import { StyleNode } from "./nodes/style-node";

const nodeTypes = {
  style: StyleNode,
  setting: SettingNode,
  location: LocationNode,
  character: CharacterNode,
  storyImage: StoryImageNode,
  movie: MovieNode,
  comicStrip: ComicStripNode,
};

export function Canvas() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);

  return (
    <div className="relative h-full w-full">
      <AuroraBackground intensity={0.8} speed={0.1} />
      <ReactFlow<AppNode>
        colorMode="dark"
        edges={edges}
        fitView
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <AddNodePanel />
        <ModelSettingsPanel />
        <ProjectPanel />
      </ReactFlow>
    </div>
  );
}
