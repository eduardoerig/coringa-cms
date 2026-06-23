// Modelo de dados da Tela Livre (seção `canvas`) + operações imutáveis puras.
// Reusado pelo render (CanvasSection/CanvasElementRenderer) e pela interação (CanvasEditor).
// A ordem do array é a ordem de empilhamento (z): o primeiro fica atrás, o último na frente.

export type CanvasElementType = "text" | "image" | "shape" | "button" | "icon" | "embed";

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  /** Posição/tamanho em design-px. x/w são relativos a designWidth; y/h à altura da tela. */
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number; // graus
  opacity: number; // 0..1
  locked?: boolean;
  props: Record<string, unknown>;
}

export function genElId(prefix = "el"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// ---- Operações (sempre retornam um novo array) ----

export function addElement(els: CanvasElement[], el: CanvasElement): CanvasElement[] {
  return [...els, el];
}

export function removeElement(els: CanvasElement[], id: string): CanvasElement[] {
  return els.filter((e) => e.id !== id);
}

export function updateElementProps(els: CanvasElement[], id: string, props: Record<string, unknown>): CanvasElement[] {
  return els.map((e) => (e.id === id ? { ...e, props: { ...e.props, ...props } } : e));
}

/** Campos de transform/estado editáveis diretamente no elemento. */
export type ElementTransform = Partial<Pick<CanvasElement, "x" | "y" | "w" | "h" | "rotation" | "opacity" | "locked">>;

export function setTransform(els: CanvasElement[], id: string, t: ElementTransform): CanvasElement[] {
  return els.map((e) => (e.id === id ? { ...e, ...t } : e));
}

export type ZMove = "front" | "back" | "forward" | "backward";

/** Move o elemento na ordem de empilhamento (a ordem do array é o z). */
export function moveZ(els: CanvasElement[], id: string, dir: ZMove): CanvasElement[] {
  const i = els.findIndex((e) => e.id === id);
  if (i < 0) return els;
  const next = [...els];
  const [el] = next.splice(i, 1);
  if (dir === "front") next.push(el);
  else if (dir === "back") next.unshift(el);
  else if (dir === "forward") next.splice(Math.min(i + 1, next.length), 0, el);
  else next.splice(Math.max(i - 1, 0), 0, el);
  return next;
}

/** Duplica o elemento (id novo, props clonadas) com leve deslocamento, no topo. */
export function duplicateElement(els: CanvasElement[], id: string, offset = 16): CanvasElement[] {
  const original = els.find((e) => e.id === id);
  if (!original) return els;
  const copy: CanvasElement = {
    ...JSON.parse(JSON.stringify(original)),
    id: genElId(),
    x: original.x + offset,
    y: original.y + offset,
  };
  return [...els, copy];
}

/** Gera ids novos para todos os elementos (ao inserir uma tela salva, evitando colisão). */
export function regenerateElementIds(els: CanvasElement[]): CanvasElement[] {
  return els.map((e) => ({ ...JSON.parse(JSON.stringify(e)), id: genElId() }));
}

export function findElement(els: CanvasElement[], id: string | null): CanvasElement | null {
  if (!id) return null;
  return els.find((e) => e.id === id) ?? null;
}
