"use client";

import { Panel } from "@xyflow/react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_LOCATION_NODES, useFlowStore } from "@/lib/store";

export function AddNodePanel() {
  const addLocationNode = useFlowStore((s) => s.addLocationNode);
  const locationCount = useFlowStore(
    (s) => s.nodes.filter((n) => n.type === "location").length
  );

  const locationLimitReached = locationCount >= MAX_LOCATION_NODES;

  return (
    <Panel position="top-right">
      <div className="flex gap-2 rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-lg">
        <Button
          className="nodrag"
          disabled={locationLimitReached}
          onClick={addLocationNode}
          size="sm"
          title={
            locationLimitReached
              ? `Maximum ${MAX_LOCATION_NODES} locations reached`
              : "Add Location node"
          }
          variant="outline"
        >
          <MapPin className="size-3" />
          Location{" "}
          {locationLimitReached && `(${locationCount}/${MAX_LOCATION_NODES})`}
        </Button>
      </div>
    </Panel>
  );
}
