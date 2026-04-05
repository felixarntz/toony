"use client";

import { X } from "lucide-react";
import type { NodeError } from "@/lib/types";

export function NodeErrorBanner(opts: {
  error: NodeError;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-3 rounded-md border border-red-500/40 bg-red-950/30 p-2">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 text-red-200 text-xs">
          <div className="break-words">{opts.error.message}</div>
        </div>
        <button
          aria-label="Dismiss error"
          className="nodrag rounded p-0.5 text-red-200/80 transition-colors hover:bg-red-900/40 hover:text-red-100"
          onClick={opts.onDismiss}
          type="button"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
