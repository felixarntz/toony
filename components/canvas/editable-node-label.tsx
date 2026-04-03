"use client";

import { Pencil } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface EditableNodeLabelProps {
  className?: string;
  name: string;
  onNameChange: (name: string) => void;
  placeholder: string;
}

export function EditableNodeLabel({
  className = "",
  name,
  onNameChange,
  placeholder,
}: EditableNodeLabelProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(name);
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [editing, name]);

  const commit = useCallback(() => {
    setEditing(false);
    onNameChange(draft.trim());
  }, [draft, onNameChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        commit();
      } else if (e.key === "Escape") {
        setEditing(false);
      }
    },
    [commit]
  );

  if (editing) {
    return (
      <input
        className={`nodrag mb-3 w-full rounded border border-zinc-600 bg-zinc-800 px-1 py-0.5 font-semibold text-sm uppercase tracking-wide focus:outline-none ${className}`}
        onBlur={commit}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        ref={inputRef}
        value={draft}
      />
    );
  }

  return (
    <button
      className={`nodrag mb-3 flex items-center gap-1.5 font-semibold text-sm uppercase tracking-wide ${className}`}
      onClick={() => setEditing(true)}
      title="Click to rename"
      type="button"
    >
      <span className="truncate">{name || placeholder}</span>
      <Pencil className="size-3 shrink-0 opacity-40" />
    </button>
  );
}
