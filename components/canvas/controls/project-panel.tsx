"use client";

import { Panel } from "@xyflow/react";
import { Download, Package, Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  buildZipBlob,
  collectAssets,
  deserializeProject,
  downloadBlob,
  downloadJson,
  serializeProject,
} from "@/lib/project-io";
import { useFlowStore } from "@/lib/store";

export function ProjectPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nodes = useFlowStore((s) => s.nodes);

  const handleExportProject = () => {
    const json = serializeProject();
    downloadJson({ content: json, filename: "toony-project.json" });
  };

  const handleImportProject = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result;
      if (typeof json === "string") {
        deserializeProject({ json });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleExportAssets = () => {
    const assets = collectAssets({ nodes });
    if (assets.length === 0) {
      return;
    }
    const blob = buildZipBlob({ assets });
    downloadBlob({ blob, filename: "toony-assets.zip" });
  };

  const hasAssets = nodes.some((n) => {
    if (n.type === "location" && n.data.generatedImage) {
      return true;
    }
    if (n.type === "character" && (n.data.frontalImage || n.data.sideImage)) {
      return true;
    }
    if (n.type === "storyImage" && n.data.generatedImage) {
      return true;
    }
    if (n.type === "movie" && n.data.generatedVideoUrl) {
      return true;
    }
    return false;
  });

  return (
    <Panel position="top-left">
      <div className="flex gap-2 rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-lg">
        <Button
          className="nodrag"
          onClick={handleExportProject}
          size="sm"
          title="Export project as JSON"
          variant="outline"
        >
          <Download className="size-3" />
          Export Project
        </Button>
        <Button
          className="nodrag"
          onClick={handleImportProject}
          size="sm"
          title="Import project from JSON"
          variant="outline"
        >
          <Upload className="size-3" />
          Import Project
        </Button>
        <Button
          className="nodrag"
          disabled={!hasAssets}
          onClick={handleExportAssets}
          size="sm"
          title={
            hasAssets
              ? "Export all generated assets as ZIP"
              : "No generated assets to export"
          }
          variant="outline"
        >
          <Package className="size-3" />
          Export Assets
        </Button>
        <input
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
      </div>
    </Panel>
  );
}
