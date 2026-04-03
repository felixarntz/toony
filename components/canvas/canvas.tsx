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
import { CharacterNode } from "./nodes/character-node";
import { LocationNode } from "./nodes/location-node";
import { SettingNode } from "./nodes/setting-node";
import { StyleNode } from "./nodes/style-node";

const nodeTypes = {
  style: StyleNode,
  setting: SettingNode,
  location: LocationNode,
  character: CharacterNode,
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
        <Background color="#333" gap={20} variant={BackgroundVariant.Dots} />
        <Controls />
        <AddNodePanel />
      </ReactFlow>
    </div>
  );
}
