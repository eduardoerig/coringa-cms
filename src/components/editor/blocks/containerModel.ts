// Modelo de dados do Container (layout livre) + operações imutáveis puras.
// Reusado pelo render no canvas (Container.tsx) e pelo painel de propriedades.

export interface ContainerBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

export interface ContainerColumn {
  id: string;
  width: string; // "1/1" | "1/2" | "1/3" | "2/3" | "1/4" | "3/4"
  blocks: ContainerBlock[];
}

export interface ContainerRow {
  id: string;
  columns: ContainerColumn[];
}

export function genId(prefix = "blk"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// Layouts de linha oferecidos ao adicionar uma nova linha.
export const ROW_LAYOUTS: { id: string; label: string; widths: string[] }[] = [
  { id: "1", label: "1 coluna", widths: ["1/1"] },
  { id: "1-1", label: "2 colunas", widths: ["1/2", "1/2"] },
  { id: "1-1-1", label: "3 colunas", widths: ["1/3", "1/3", "1/3"] },
  { id: "1-2", label: "1/3 + 2/3", widths: ["1/3", "2/3"] },
  { id: "2-1", label: "2/3 + 1/3", widths: ["2/3", "1/3"] },
  { id: "1-1-1-1", label: "4 colunas", widths: ["1/4", "1/4", "1/4", "1/4"] },
];

// Fração para grid-template-columns (ex.: "1/3" + "2/3" → "1fr 2fr").
export function widthToFr(w: string): string {
  const map: Record<string, string> = { "1/1": "1", "1/2": "1", "1/3": "1", "2/3": "2", "1/4": "1", "3/4": "3" };
  return map[w] ?? "1";
}

function equalWidth(n: number): string {
  if (n >= 4) return "1/4";
  if (n === 3) return "1/3";
  if (n === 2) return "1/2";
  return "1/1";
}

export function makeColumn(width = "1/1"): ContainerColumn {
  return { id: genId("col"), width, blocks: [] };
}

export function makeRow(widths: string[]): ContainerRow {
  return { id: genId("row"), columns: widths.map((w) => makeColumn(w)) };
}

// ---- Operações (sempre retornam um novo array) ----

export function addRow(rows: ContainerRow[], widths: string[]): ContainerRow[] {
  return [...rows, makeRow(widths)];
}

export function removeRow(rows: ContainerRow[], rowId: string): ContainerRow[] {
  return rows.filter((r) => r.id !== rowId);
}

export function moveRow(rows: ContainerRow[], rowId: string, dir: "up" | "down"): ContainerRow[] {
  const i = rows.findIndex((r) => r.id === rowId);
  if (i < 0) return rows;
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= rows.length) return rows;
  const next = [...rows];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function addColumn(rows: ContainerRow[], rowId: string): ContainerRow[] {
  return rows.map((r) => {
    if (r.id !== rowId) return r;
    const cols = [...r.columns, makeColumn()];
    const w = equalWidth(cols.length);
    return { ...r, columns: cols.map((c) => ({ ...c, width: w })) };
  });
}

export function removeColumn(rows: ContainerRow[], rowId: string, colId: string): ContainerRow[] {
  return rows.map((r) => {
    if (r.id !== rowId) return r;
    const cols = r.columns.filter((c) => c.id !== colId);
    const w = equalWidth(cols.length);
    return { ...r, columns: cols.map((c) => ({ ...c, width: w })) };
  });
}

export function addBlock(rows: ContainerRow[], rowId: string, colId: string, block: ContainerBlock): ContainerRow[] {
  return rows.map((r) =>
    r.id !== rowId ? r : { ...r, columns: r.columns.map((c) => (c.id !== colId ? c : { ...c, blocks: [...c.blocks, block] })) }
  );
}

export function removeBlock(rows: ContainerRow[], blockId: string): ContainerRow[] {
  return rows.map((r) => ({ ...r, columns: r.columns.map((c) => ({ ...c, blocks: c.blocks.filter((b) => b.id !== blockId) })) }));
}

export function updateBlock(rows: ContainerRow[], blockId: string, props: Record<string, unknown>): ContainerRow[] {
  return rows.map((r) => ({
    ...r,
    columns: r.columns.map((c) => ({
      ...c,
      blocks: c.blocks.map((b) => (b.id !== blockId ? b : { ...b, props: { ...b.props, ...props } })),
    })),
  }));
}

export function moveBlock(rows: ContainerRow[], blockId: string, dir: "up" | "down"): ContainerRow[] {
  return rows.map((r) => ({
    ...r,
    columns: r.columns.map((c) => {
      const i = c.blocks.findIndex((b) => b.id === blockId);
      if (i < 0) return c;
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= c.blocks.length) return c;
      const nb = [...c.blocks];
      [nb[i], nb[j]] = [nb[j], nb[i]];
      return { ...c, blocks: nb };
    }),
  }));
}

// Gera ids novos para todas as linhas/colunas/blocos (ao inserir um bloco salvo,
// evitando colisão de ids com outros containers da página).
export function regenerateRowIds(rows: ContainerRow[]): ContainerRow[] {
  return rows.map((r) => ({
    id: genId("row"),
    columns: r.columns.map((c) => ({
      id: genId("col"),
      width: c.width,
      blocks: c.blocks.map((b) => ({ id: genId("blk"), type: b.type, props: JSON.parse(JSON.stringify(b.props)) })),
    })),
  }));
}

export function findBlock(rows: ContainerRow[], blockId: string): ContainerBlock | null {
  for (const r of rows) for (const c of r.columns) {
    const b = c.blocks.find((bl) => bl.id === blockId);
    if (b) return b;
  }
  return null;
}
