// Modelo de dados da Tela Livre (seção `canvas`) + operações imutáveis puras.
// Reusado pelo render (CanvasSection/CanvasElementRenderer) e pela interação (CanvasEditor).
// A ordem do array é a ordem de empilhamento (z): o primeiro fica atrás, o último na frente.

export type CanvasElementType = "text" | "image" | "shape" | "button" | "icon" | "embed";

export type Viewport = "desktop" | "tablet" | "mobile";

/** Override de transform/visibilidade por dispositivo (tablet/mobile). */
export interface RespOverride {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  rotation?: number;
  hidden?: boolean;
}

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  /** Posição/tamanho em design-px (desktop). x/w relativos a designWidth; y/h à altura. */
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number; // graus
  opacity: number; // 0..1
  locked?: boolean;
  /** Ajustes por dispositivo (cascata: mobile herda de tablet, que herda do desktop). */
  responsive?: { tablet?: RespOverride; mobile?: RespOverride };
  props: Record<string, unknown>;
}

export interface ResolvedTransform { x: number; y: number; w: number; h: number; rotation: number; hidden: boolean }

/** Resolve posição/tamanho/visibilidade efetivos do elemento para um dispositivo. */
export function resolveElement(el: CanvasElement, viewport: Viewport): ResolvedTransform {
  const base: ResolvedTransform = { x: el.x, y: el.y, w: el.w, h: el.h, rotation: el.rotation, hidden: false };
  if (viewport === "desktop" || !el.responsive) return base;
  const t = el.responsive.tablet ?? {};
  if (viewport === "tablet") return { ...base, ...t };
  const m = el.responsive.mobile ?? {};
  return { ...base, ...t, ...m };
}

/** Aplica um override a UM elemento no dispositivo informado (desktop = base). */
export function applyDeviceTransform(el: CanvasElement, viewport: Viewport, t: RespOverride): CanvasElement {
  if (viewport === "desktop") return { ...el, ...t };
  const prev = el.responsive?.[viewport] ?? {};
  return { ...el, responsive: { ...el.responsive, [viewport]: { ...prev, ...t } } };
}

export function setDeviceTransform(els: CanvasElement[], id: string, viewport: Viewport, t: RespOverride): CanvasElement[] {
  return els.map((e) => (e.id === id ? applyDeviceTransform(e, viewport, t) : e));
}

export function resolveHeight(heights: { desktop: number; tablet?: number; mobile?: number }, viewport: Viewport): number {
  if (viewport === "tablet") return heights.tablet ?? heights.desktop;
  if (viewport === "mobile") return heights.mobile ?? heights.tablet ?? heights.desktop;
  return heights.desktop;
}

export function hasResponsive(els: CanvasElement[]): boolean {
  return els.some((e) => !!e.responsive && (!!e.responsive.tablet || !!e.responsive.mobile));
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
