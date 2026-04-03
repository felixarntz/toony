"use client";

import { Panel } from "@xyflow/react";
import { ChevronDown, Download, Package, Upload } from "lucide-react";
import { useRef, useState } from "react";
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
  const [expanded, setExpanded] = useState(true);
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
      <div className="w-fit rounded-lg border border-[var(--node-input-border)] bg-[var(--node-surface)] p-2 backdrop-blur-sm">
        <button
          className="flex cursor-pointer items-center gap-1 font-medium text-foreground/70 text-xs"
          onClick={() => setExpanded((prev) => !prev)}
          type="button"
        >
          Toony
          <ChevronDown
            className={`size-3 transition-transform duration-200 ${expanded ? "" : "-rotate-90"}`}
          />
        </button>
        <div
          className="grid transition-[grid-template-rows,grid-template-columns] duration-200 ease-in-out"
          style={{
            gridTemplateRows: expanded ? "1fr" : "0fr",
            gridTemplateColumns: expanded ? "1fr" : "0fr",
          }}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="nodrag w-full justify-start"
                onClick={handleExportProject}
                size="sm"
                title="Export project as JSON"
                variant="outline"
              >
                <Download className="size-3" />
                Export Project
              </Button>
              <Button
                className="nodrag w-full justify-start"
                onClick={handleImportProject}
                size="sm"
                title="Import project from JSON"
                variant="outline"
              >
                <Upload className="size-3" />
                Import Project
              </Button>
              <Button
                className="nodrag w-full justify-start"
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
            </div>
          </div>
        </div>
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
