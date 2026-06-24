import { useState, useEffect, useCallback } from "react";

interface PanelOptions {
  defaultWidth: number;
  min: number;
  max: number;
}

interface PersistedState {
  width: number;
  collapsed: boolean;
}

/**
 * Mantém a largura e o estado de colapso de um painel lateral em localStorage.
 * Para evitar mismatch de SSR, inicia sempre com os defaults e só aplica o valor
 * salvo após montar no cliente.
 */
export function usePersistentPanel(key: string, { defaultWidth, min, max }: PanelOptions) {
  const [width, setWidthState] = useState(defaultWidth);
  const [collapsed, setCollapsedState] = useState(false);

  // Hidrata a partir do localStorage só no cliente (evita mismatch de SSR).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        if (typeof parsed.width === "number") {
          setWidthState(Math.min(max, Math.max(min, parsed.width)));
        }
        if (typeof parsed.collapsed === "boolean") setCollapsedState(parsed.collapsed);
      }
    } catch {
      /* localStorage indisponível ou JSON inválido — usa defaults */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persist = useCallback(
    (next: PersistedState) => {
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignora falhas de persistência */
      }
    },
    [key]
  );

  const setWidth = useCallback(
    (w: number) => {
      const clamped = Math.min(max, Math.max(min, w));
      setWidthState(clamped);
      setCollapsedState((c) => {
        persist({ width: clamped, collapsed: c });
        return c;
      });
    },
    [persist, min, max]
  );

  const setCollapsed = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setCollapsedState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        setWidthState((w) => {
          persist({ width: w, collapsed: next });
          return w;
        });
        return next;
      });
    },
    [persist]
  );

  return { width, setWidth, collapsed, setCollapsed, min, max };
}
