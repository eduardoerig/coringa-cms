// Geometria pura da Tela Livre — sem React, sem DOM. Tudo em design-px salvo nota.
// O CanvasEditor faz a ponte com coordenadas de tela (px reais) usando `scale`.

export const MIN_SIZE = 12; // tamanho mínimo de um elemento, em design-px

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/**
 * Aplica resize a um box (design-px) dado o handle e o delta (já em design-px).
 * `keepRatio` mantém a proporção (usado em alças de canto, ou com Shift).
 * Resize é axis-aligned: a rotação é aplicada só visualmente (transform) no wrapper.
 */
export function resizeBox(box: Box, handle: ResizeHandle, dx: number, dy: number, keepRatio: boolean, minSize = MIN_SIZE): Box {
  let { x, y, w, h } = box;
  const ratio = box.w / box.h || 1;
  const hasE = handle.includes("e");
  const hasW = handle.includes("w");
  const hasS = handle.includes("s");
  const hasN = handle.includes("n");

  if (hasE) w = box.w + dx;
  if (hasW) { w = box.w - dx; x = box.x + dx; }
  if (hasS) h = box.h + dy;
  if (hasN) { h = box.h - dy; y = box.y + dy; }

  if (keepRatio) {
    // Recalcula h a partir de w mantendo a proporção; ancora o lado oposto ao handle.
    const newH = w / ratio;
    if (hasN) y += h - newH;
    h = newH;
  }

  if (w < minSize) { if (hasW) x -= minSize - w; w = minSize; }
  if (h < minSize) { if (hasN) y -= minSize - h; h = minSize; }

  return { x, y, w, h };
}

/** Ângulo (graus) do centro (cx,cy) até o ponto (px,py). */
export function angleFromCenter(cx: number, cy: number, px: number, py: number): number {
  return (Math.atan2(py - cy, px - cx) * 180) / Math.PI;
}

export function snapAngle(deg: number, step = 15): number {
  return Math.round(deg / step) * step;
}

/**
 * Snapping simples: aproxima `value` de cada alvo dentro do limiar (design-px).
 * Retorna o valor ajustado e a linha-guia (alvo) acionada, se houver.
 */
export function snapTo(value: number, targets: number[], threshold: number): { value: number; guide: number | null } {
  let best: number | null = null;
  let bestDist = threshold;
  for (const t of targets) {
    const d = Math.abs(value - t);
    if (d <= bestDist) { bestDist = d; best = t; }
  }
  return best == null ? { value, guide: null } : { value: best, guide: best };
}
