"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface LiveTextDraftOptions {
  onChange: (value: string) => void;
  value: string;
}

interface LiveTextDraft {
  onBlur: () => void;
  onChange: (value: string) => void;
  onFocus: () => void;
  value: string;
}

export function useLiveTextDraft(opts: LiveTextDraftOptions): LiveTextDraft {
  const [draft, setDraft] = useState(opts.value);
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(opts.value);
    }
  }, [opts.value]);

  const onFocus = useCallback(() => {
    focusedRef.current = true;
  }, []);

  const onBlur = useCallback(() => {
    focusedRef.current = false;
    if (draft !== opts.value) {
      opts.onChange(draft);
    }
  }, [draft, opts]);

  const onChange = useCallback(
    (value: string) => {
      setDraft(value);
      opts.onChange(value);
    },
    [opts]
  );

  return {
    value: draft,
    onFocus,
    onBlur,
    onChange,
  };
}
