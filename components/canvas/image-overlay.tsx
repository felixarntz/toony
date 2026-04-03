"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface ImageOverlayProps {
  alt: string;
  src: string;
}

export function ImageOverlay({ src, alt }: ImageOverlayProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, close]);

  return (
    <>
      <button
        className="block w-full cursor-zoom-in"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Image
          alt={alt}
          className="w-full rounded"
          height={384}
          src={src}
          unoptimized
          width={384}
        />
      </button>
      {open && (
        <button
          className="fixed inset-0 z-[9999] flex cursor-zoom-out items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={close}
          type="button"
        >
          <span className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700">
            <X className="size-4" />
          </span>
          <Image
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            height={1024}
            src={src}
            unoptimized
            width={1024}
          />
        </button>
      )}
    </>
  );
}
