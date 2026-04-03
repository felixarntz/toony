"use client";

import { X } from "lucide-react";

interface RemoveNodeButtonProps {
  onClick: () => void;
}

export function RemoveNodeButton({ onClick }: RemoveNodeButtonProps) {
  return (
    <button
      aria-label="Remove node"
      className="nodrag absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 transition-colors hover:bg-red-900/50 hover:text-red-400"
      onClick={onClick}
      type="button"
    >
      <X className="size-3" />
    </button>
  );
}
