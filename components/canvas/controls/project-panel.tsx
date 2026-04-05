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

  const handleExportProject = async () => {
    const json = await serializeProject();
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

  const handleExportImages = () => {
    const images = collectAssets({ nodes });
    if (images.length === 0) {
      return;
    }
    const blob = buildZipBlob({ assets: images });
    downloadBlob({ blob, filename: "toony-images.zip" });
  };

  const hasImages = nodes.some((n) => {
    if (n.type === "location" && n.data.generatedImage) {
      return true;
    }
    if (n.type === "character" && (n.data.frontalImage || n.data.sideImage)) {
      return true;
    }
    if (n.type === "storyImage" && n.data.generatedImage) {
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
                className="nodrag h-8 w-full justify-start rounded-lg border-[var(--node-input-border)] bg-[var(--node-input-bg)] px-2.5 text-foreground text-xs hover:bg-[var(--node-input-bg)]"
                onClick={handleExportProject}
                size="default"
                title="Export project as JSON"
                variant="ghost"
              >
                <Download className="size-3.5 shrink-0 text-muted-foreground" />
                Export Project
              </Button>
              <Button
                className="nodrag h-8 w-full justify-start rounded-lg border-[var(--node-input-border)] bg-[var(--node-input-bg)] px-2.5 text-foreground text-xs hover:bg-[var(--node-input-bg)]"
                onClick={handleImportProject}
                size="default"
                title="Import project from JSON"
                variant="ghost"
              >
                <Upload className="size-3.5 shrink-0 text-muted-foreground" />
                Import Project
              </Button>
              <Button
                className="nodrag h-8 w-full justify-start rounded-lg border-[var(--node-input-border)] bg-[var(--node-input-bg)] px-2.5 text-foreground text-xs hover:bg-[var(--node-input-bg)]"
                disabled={!hasImages}
                onClick={handleExportImages}
                size="default"
                title={
                  hasImages
                    ? "Export generated images as ZIP"
                    : "No generated images to export"
                }
                variant="ghost"
              >
                <Package className="size-3.5 shrink-0 text-muted-foreground" />
                Export Images
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
