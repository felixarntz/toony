"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useFlowStore } from "@/lib/store";
import type { AppNode } from "@/lib/types";
import { AddNodePanel } from "./controls/add-node-panel";
import { ModelSettingsPanel } from "./controls/model-settings-panel";
import { ProjectPanel } from "./controls/project-panel";
import { CharacterNode } from "./nodes/character-node";
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
};

export function Canvas() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);

  return (
    <div className="h-full w-full">
      <ReactFlow<AppNode>
        colorMode="dark"
        edges={edges}
        fitView
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="oklch(0.16 0 0)"
          gap={24}
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <Controls />
        <AddNodePanel />
        <ModelSettingsPanel />
        <ProjectPanel />
      </ReactFlow>
    </div>
  );
}
