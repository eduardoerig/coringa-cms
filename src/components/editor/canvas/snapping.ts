// Snapping de movimento da Tela Livre: casa as arestas/centro do elemento arrastado
// com a tela e com os outros elementos (guias inteligentes); fallback para grade.
import type { CanvasElement } from "./canvasModel";

export interface Guide { axis: "x" | "y"; pos: number }
export interface SnapOutcome { x: number; y: number; guides: Guide[] }

interface MoveBox { x: number; y: number; w: number; h: number }

// Tenta casar uma das arestas (início, meio, fim) do box com uma das linhas-alvo.
function snapAxis(start: number, size: number, lines: number[], threshold: number): { value: number; guide: number | null } {
  const offsets = [0, size / 2, size];
  let value = start;
  let best = Infinity;
  let guide: number | null = null;
  for (const off of offsets) {
    for (const line of lines) {
      const cand = line - off;
      const d = Math.abs(start - cand);
      if (d < best) { best = d; value = cand; guide = line; }
    }
  }
  return best > threshold ? { value: start, guide: null } : { value, guide };
}

export function computeMoveSnap(box: MoveBox, others: CanvasElement[], DW: number, H: number, threshold: number, grid: number): SnapOutcome {
  const xLines = [0, DW / 2, DW];
  const yLines = [0, H / 2, H];
  for (const o of others) {
    xLines.push(o.x, o.x + o.w / 2, o.x + o.w);
    yLines.push(o.y, o.y + o.h / 2, o.y + o.h);
  }

  const sx = snapAxis(box.x, box.w, xLines, threshold);
  const sy = snapAxis(box.y, box.h, yLines, threshold);

  let nx = sx.value;
  let ny = sy.value;
  const guides: Guide[] = [];
  if (sx.guide != null) guides.push({ axis: "x", pos: sx.guide });
  else if (grid > 0) nx = Math.round(box.x / grid) * grid;
  if (sy.guide != null) guides.push({ axis: "y", pos: sy.guide });
  else if (grid > 0) ny = Math.round(box.y / grid) * grid;

  return { x: nx, y: ny, guides };
}
