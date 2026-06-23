"use client";

import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";
import {
  type CanvasElement,
  type CanvasElementType,
  genElId,
  addElement,
  removeElement,
  updateElementProps,
  setTransform,
  moveZ,
  findElement,
} from "./canvasModel";
import { canvasElementRegistry, canvasElementTypes } from "./canvasElementRegistry";
import { CanvasElementRenderer } from "./CanvasElementRenderer";
import { resizeBox, angleFromCenter, snapAngle, type ResizeHandle, type Box } from "./transform";
import { computeMoveSnap, type Guide } from "./snapping";
import { Copy, Trash2, Lock, Unlock, BringToFront, SendToBack, RotateCw } from "lucide-react";

interface Props {
  sectionId: string;
  designWidth: number;
  height: number;
  elements: CanvasElement[];
  grid: number;
  background: React.CSSProperties;
}

type LiveTransform = { id: string; x: number; y: number; w: number; h: number; rotation: number };
type AlignAxis = "left" | "centerH" | "right" | "top" | "middleV" | "bottom";

interface Gesture {
  mode: "move" | "resize" | "rotate";
  handle: ResizeHandle | null;
  id: string;
  startX: number;
  startY: number;
  scaleX: number; // px de tela por design-px (horizontal)
  scaleY: number;
  cx: number; // centro do elemento em px de tela (para rotação)
  cy: number;
  start: { x: number; y: number; w: number; h: number; rotation: number };
  live: LiveTransform;
}

const SNAP = 7; // limiar de snapping, em design-px

// Alças de redimensionamento (posição + cursor).
const HANDLES: { h: ResizeHandle; pos: string; cursor: string }[] = [
  { h: "nw", pos: "top-0 left-0 -translate-x-1/2 -translate-y-1/2", cursor: "nwse-resize" },
  { h: "n", pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2", cursor: "ns-resize" },
  { h: "ne", pos: "top-0 right-0 translate-x-1/2 -translate-y-1/2", cursor: "nesw-resize" },
  { h: "e", pos: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2", cursor: "ew-resize" },
  { h: "se", pos: "bottom-0 right-0 translate-x-1/2 translate-y-1/2", cursor: "nwse-resize" },
  { h: "s", pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2", cursor: "ns-resize" },
  { h: "sw", pos: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2", cursor: "nesw-resize" },
  { h: "w", pos: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2", cursor: "ew-resize" },
];

const ALIGN_BTNS: { lbl: string; axis: AlignAxis; title: string }[] = [
  { lbl: "E", axis: "left", title: "Alinhar à esquerda" },
  { lbl: "C", axis: "centerH", title: "Centralizar na horizontal" },
  { lbl: "D", axis: "right", title: "Alinhar à direita" },
  { lbl: "T", axis: "top", title: "Alinhar ao topo" },
  { lbl: "M", axis: "middleV", title: "Centralizar na vertical" },
  { lbl: "B", axis: "bottom", title: "Alinhar à base" },
];

export function CanvasEditor({ sectionId, designWidth: DW, height: H, elements, grid, background }: Props) {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);
  const mutate = useEditorStore((s) => s.mutateCanvasElements);
  const updateSectionProps = useEditorStore((s) => s.updateSectionProps);

  const artboardRef = useRef<HTMLDivElement | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const heightGesture = useRef<{ startY: number; startH: number; scaleY: number; live: number } | null>(null);
  const groupGesture = useRef<{ startX: number; startY: number; scaleX: number; scaleY: number; live: { dx: number; dy: number } } | null>(null);
  const marqueeGesture = useRef<{ rectLeft: number; rectTop: number; scaleX: number; scaleY: number; startX: number; startY: number; live: { x: number; y: number; w: number; h: number } } | null>(null);
  const editingRef = useRef<HTMLElement | null>(null);
  const selectedIdsRef = useRef<string[]>([]);

  const [drag, setDrag] = useState<LiveTransform | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupMove, setGroupMove] = useState<{ dx: number; dy: number } | null>(null);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const effH = dragHeight ?? H;

  // Seleção efetiva: se o primário (store) está no conjunto local, usa o conjunto (multi);
  // senão, trata como seleção simples do primário (ex.: clique numa camada do painel).
  const primaryId = selectedNodeId;
  const selIds = primaryId && selectedIds.includes(primaryId) ? selectedIds : primaryId ? [primaryId] : [];
  const multi = selIds.length > 1;

  // Mantém o ref em sincronia para os handlers (gesto/teclado) lerem a seleção atual.
  useEffect(() => { selectedIdsRef.current = selIds; });

  const getEls = (): CanvasElement[] =>
    (useEditorStore.getState().sections.find((s) => s.id === sectionId)?.props.elements as CanvasElement[]) ?? [];

  // ---- Adicionar elemento (no centro da tela) ----
  const addEl = (type: CanvasElementType) => {
    const reg = canvasElementRegistry[type];
    const { w, h } = reg.defaultSize;
    const el: CanvasElement = {
      id: genElId(),
      type,
      x: Math.round((DW - w) / 2),
      y: Math.round((effH - h) / 2),
      w,
      h,
      rotation: 0,
      opacity: 1,
      props: JSON.parse(JSON.stringify(reg.defaultProps)),
    };
    mutate(sectionId, (cur) => addElement(cur, el));
    setSelectedIds([el.id]);
    selectNode(el.id);
  };

  // ---- Gesto de um elemento (mover / redimensionar / girar) ----
  const startGesture = (mode: Gesture["mode"], handle: ResizeHandle | null, el: CanvasElement, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = artboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = rect.width / DW;
    const scaleY = rect.height / effH;
    const start = { x: el.x, y: el.y, w: el.w, h: el.h, rotation: el.rotation };
    gesture.current = {
      mode, handle, id: el.id, startX: e.clientX, startY: e.clientY, scaleX, scaleY,
      cx: rect.left + (el.x + el.w / 2) * scaleX,
      cy: rect.top + (el.y + el.h / 2) * scaleY,
      start, live: { id: el.id, ...start },
    };
    setDrag({ id: el.id, ...start });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  };

  const onMove = (e: PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const dx = (e.clientX - g.startX) / g.scaleX;
    const dy = (e.clientY - g.startY) / g.scaleY;
    if (g.mode === "move") {
      const others = getEls().filter((e2) => e2.id !== g.id);
      const snap = computeMoveSnap({ x: g.start.x + dx, y: g.start.y + dy, w: g.start.w, h: g.start.h }, others, DW, effH, SNAP, grid);
      g.live = { id: g.id, ...g.start, x: Math.round(snap.x), y: Math.round(snap.y) };
      setGuides(snap.guides);
    } else if (g.mode === "resize" && g.handle) {
      const box: Box = resizeBox(g.start, g.handle, dx, dy, e.shiftKey);
      g.live = { id: g.id, rotation: g.start.rotation, x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.w), h: Math.round(box.h) };
    } else if (g.mode === "rotate") {
      const startAngle = angleFromCenter(g.cx, g.cy, g.startX, g.startY);
      const nowAngle = angleFromCenter(g.cx, g.cy, e.clientX, e.clientY);
      let rot = g.start.rotation + (nowAngle - startAngle);
      if (e.shiftKey) rot = snapAngle(rot, 15);
      g.live = { id: g.id, ...g.start, rotation: Math.round(rot) };
    }
    setDrag({ ...g.live });
  };

  const onUp = () => {
    const g = gesture.current;
    window.removeEventListener("pointermove", onMove);
    if (g) {
      const s = g.start;
      const l = g.live;
      const changed = s.x !== l.x || s.y !== l.y || s.w !== l.w || s.h !== l.h || s.rotation !== l.rotation;
      if (changed) mutate(sectionId, (els) => setTransform(els, g.id, { x: l.x, y: l.y, w: l.w, h: l.h, rotation: l.rotation }));
    }
    gesture.current = null;
    setDrag(null);
    setGuides([]);
  };

  // ---- Mover o grupo (vários selecionados) ----
  const onGroupMoveMove = (e: PointerEvent) => {
    const g = groupGesture.current;
    if (!g) return;
    g.live = { dx: Math.round((e.clientX - g.startX) / g.scaleX), dy: Math.round((e.clientY - g.startY) / g.scaleY) };
    setGroupMove(g.live);
  };
  const onGroupMoveUp = () => {
    window.removeEventListener("pointermove", onGroupMoveMove);
    const g = groupGesture.current;
    if (g && (g.live.dx !== 0 || g.live.dy !== 0)) {
      const ids = new Set(selectedIdsRef.current);
      const { dx, dy } = g.live;
      mutate(sectionId, (els) => els.map((e2) => (ids.has(e2.id) && !e2.locked ? { ...e2, x: e2.x + dx, y: e2.y + dy } : e2)));
    }
    groupGesture.current = null;
    setGroupMove(null);
  };
  const startGroupMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = artboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    groupGesture.current = { startX: e.clientX, startY: e.clientY, scaleX: rect.width / DW, scaleY: rect.height / effH, live: { dx: 0, dy: 0 } };
    setGroupMove({ dx: 0, dy: 0 });
    window.addEventListener("pointermove", onGroupMoveMove);
    window.addEventListener("pointerup", onGroupMoveUp, { once: true });
  };

  // ---- Marquee (seleção por retângulo no vazio) ----
  const onMarqueeMove = (e: PointerEvent) => {
    const g = marqueeGesture.current;
    if (!g) return;
    const x0 = (g.startX - g.rectLeft) / g.scaleX;
    const y0 = (g.startY - g.rectTop) / g.scaleY;
    const x1 = (e.clientX - g.rectLeft) / g.scaleX;
    const y1 = (e.clientY - g.rectTop) / g.scaleY;
    g.live = { x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) };
    setMarquee(g.live);
  };
  const onMarqueeUp = () => {
    window.removeEventListener("pointermove", onMarqueeMove);
    const g = marqueeGesture.current;
    if (g) {
      const m = g.live;
      if (m.w > 4 || m.h > 4) {
        const hits = getEls()
          .filter((el) => !(el.x > m.x + m.w || el.x + el.w < m.x || el.y > m.y + m.h || el.y + el.h < m.y))
          .map((el) => el.id);
        setSelectedIds(hits);
        selectNode(hits.length ? hits[hits.length - 1] : null);
      }
    }
    marqueeGesture.current = null;
    setMarquee(null);
  };
  const startMarquee = (e: React.PointerEvent) => {
    const rect = artboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSelectedIds([]);
    selectNode(null);
    marqueeGesture.current = {
      rectLeft: rect.left, rectTop: rect.top, scaleX: rect.width / DW, scaleY: rect.height / effH,
      startX: e.clientX, startY: e.clientY, live: { x: 0, y: 0, w: 0, h: 0 },
    };
    window.addEventListener("pointermove", onMarqueeMove);
    window.addEventListener("pointerup", onMarqueeUp, { once: true });
  };

  // ---- Clique num elemento (simples / Shift-toggle / mover grupo) ----
  const onElementPointerDown = (e: React.PointerEvent, el: CanvasElement) => {
    if (editingId === el.id) return;
    if (e.shiftKey) {
      e.stopPropagation();
      const cur = selectedIdsRef.current;
      const next = cur.includes(el.id) ? cur.filter((i) => i !== el.id) : [...cur, el.id];
      setSelectedIds(next);
      selectNode(next.length ? next[next.length - 1] : null);
      return;
    }
    const cur = selectedIdsRef.current;
    if (cur.length > 1 && cur.includes(el.id)) {
      selectNode(el.id);
      if (!el.locked) startGroupMove(e);
      else e.stopPropagation();
      return;
    }
    setSelectedIds([el.id]);
    selectNode(el.id);
    if (!el.locked) startGesture("move", null, el, e);
    else e.stopPropagation();
  };

  // ---- Edição inline de texto (duplo-clique) ----
  const onElementDoubleClick = (e: React.MouseEvent, el: CanvasElement) => {
    if (el.type !== "text" || editingRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    const node = artboardRef.current?.querySelector(`[data-el-id="${el.id}"] [data-canvas-text]`) as HTMLElement | null;
    if (!node) return;
    editingRef.current = node;
    setEditingId(el.id);
    try { node.contentEditable = "plaintext-only"; } catch { node.contentEditable = "true"; }
    if (node.contentEditable !== "plaintext-only") node.contentEditable = "true";
    node.spellcheck = false;
    node.style.cursor = "text";
    node.style.outline = "none";
    node.focus();
    const range = document.createRange();
    range.selectNodeContents(node);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    const finish = (commit: boolean) => {
      node.removeEventListener("blur", onBlur);
      node.removeEventListener("keydown", onKey);
      node.contentEditable = "false";
      node.style.cursor = "";
      editingRef.current = null;
      setEditingId(null);
      if (commit) mutate(sectionId, (els) => updateElementProps(els, el.id, { text: node.innerText }), `text:${el.id}`);
      else node.innerText = (el.props.text as string) ?? "";
    };
    const onBlur = () => finish(true);
    const onKey = (ev: KeyboardEvent) => {
      ev.stopPropagation();
      if (ev.key === "Escape") { ev.preventDefault(); finish(false); node.blur(); }
      else if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); finish(true); node.blur(); }
    };
    node.addEventListener("blur", onBlur);
    node.addEventListener("keydown", onKey);
  };

  // ---- Arrastar a altura do artboard ----
  const onHeightMove = (e: PointerEvent) => {
    const g = heightGesture.current;
    if (!g) return;
    const nh = Math.round(Math.min(2400, Math.max(200, g.startH + (e.clientY - g.startY) / g.scaleY)));
    g.live = nh;
    setDragHeight(nh);
  };
  const onHeightUp = () => {
    window.removeEventListener("pointermove", onHeightMove);
    const g = heightGesture.current;
    if (g && g.live !== g.startH) updateSectionProps(sectionId, { height: g.live });
    heightGesture.current = null;
    setDragHeight(null);
  };
  const startHeightDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = artboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    heightGesture.current = { startY: e.clientY, startH: H, scaleY: rect.height / H, live: H };
    setDragHeight(H);
    window.addEventListener("pointermove", onHeightMove);
    window.addEventListener("pointerup", onHeightUp, { once: true });
  };

  // ---- Ações de grupo ----
  const alignGroup = (axis: AlignAxis) => {
    const ids = selIds;
    const sel = elements.filter((e) => ids.includes(e.id));
    if (sel.length < 2) return;
    const minX = Math.min(...sel.map((e) => e.x));
    const maxX = Math.max(...sel.map((e) => e.x + e.w));
    const cX = (minX + maxX) / 2;
    const minY = Math.min(...sel.map((e) => e.y));
    const maxY = Math.max(...sel.map((e) => e.y + e.h));
    const cY = (minY + maxY) / 2;
    const idset = new Set(ids);
    mutate(sectionId, (els) =>
      els.map((e) => {
        if (!idset.has(e.id)) return e;
        switch (axis) {
          case "left": return { ...e, x: Math.round(minX) };
          case "centerH": return { ...e, x: Math.round(cX - e.w / 2) };
          case "right": return { ...e, x: Math.round(maxX - e.w) };
          case "top": return { ...e, y: Math.round(minY) };
          case "middleV": return { ...e, y: Math.round(cY - e.h / 2) };
          case "bottom": return { ...e, y: Math.round(maxY - e.h) };
          default: return e;
        }
      })
    );
  };

  const distributeGroup = (axis: "h" | "v") => {
    const ids = selIds;
    const sel = elements.filter((e) => ids.includes(e.id));
    if (sel.length < 3) return;
    const center = (e: CanvasElement) => (axis === "h" ? e.x + e.w / 2 : e.y + e.h / 2);
    const sorted = [...sel].sort((a, b) => center(a) - center(b));
    const first = center(sorted[0]);
    const last = center(sorted[sorted.length - 1]);
    const step = (last - first) / (sorted.length - 1);
    const target = new Map<string, number>();
    sorted.forEach((e, i) => target.set(e.id, first + i * step));
    mutate(sectionId, (els) =>
      els.map((e) => {
        const c = target.get(e.id);
        if (c == null) return e;
        return axis === "h" ? { ...e, x: Math.round(c - e.w / 2) } : { ...e, y: Math.round(c - e.h / 2) };
      })
    );
  };

  const duplicateGroup = () => {
    const idset = new Set(selIds);
    const copies: CanvasElement[] = [];
    elements.forEach((e) => { if (idset.has(e.id)) copies.push({ ...JSON.parse(JSON.stringify(e)), id: genElId(), x: e.x + 16, y: e.y + 16 }); });
    if (!copies.length) return;
    mutate(sectionId, (els) => [...els, ...copies]);
    setSelectedIds(copies.map((c) => c.id));
    selectNode(copies[copies.length - 1].id);
  };

  const deleteGroup = () => {
    const idset = new Set(selIds);
    mutate(sectionId, (els) => els.filter((e) => !idset.has(e.id)));
    setSelectedIds([]);
    selectNode(null);
  };

  const dupSelected = (el: CanvasElement) => {
    const copy: CanvasElement = { ...JSON.parse(JSON.stringify(el)), id: genElId(), x: el.x + 16, y: el.y + 16 };
    mutate(sectionId, (cur) => addElement(cur, copy));
    setSelectedIds([copy.id]);
    selectNode(copy.id);
  };

  // ---- Atalhos de teclado (capture, p/ suprimir os globais quando há seleção) ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement;
      const editable = ae instanceof HTMLElement && ae.isContentEditable;
      if (ae?.tagName === "INPUT" || ae?.tagName === "TEXTAREA" || editable) return;
      const st = useEditorStore.getState();
      if (st.selectedSectionId !== sectionId) return;
      const ids = selectedIdsRef.current;

      if (e.key === "Escape") {
        if (ids.length) { e.preventDefault(); e.stopPropagation(); setSelectedIds([]); st.selectNode(null); }
        return;
      }
      if (!ids.length) return;
      const idset = new Set(ids);

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault(); e.stopPropagation();
        mutate(sectionId, (els) => els.filter((e2) => !idset.has(e2.id)));
        setSelectedIds([]); st.selectNode(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault(); e.stopPropagation();
        const copies: CanvasElement[] = [];
        getEls().forEach((e2) => { if (idset.has(e2.id)) copies.push({ ...JSON.parse(JSON.stringify(e2)), id: genElId(), x: e2.x + 16, y: e2.y + 16 }); });
        if (copies.length) {
          mutate(sectionId, (els) => [...els, ...copies]);
          setSelectedIds(copies.map((c) => c.id));
          st.selectNode(copies[copies.length - 1].id);
        }
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault(); e.stopPropagation();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        mutate(sectionId, (els) => els.map((e2) => (idset.has(e2.id) && !e2.locked ? { ...e2, x: e2.x + dx, y: e2.y + dy } : e2)), `nudge:group`);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "]" || e.key === "[")) {
        const pid = st.selectedNodeId;
        if (pid) { e.preventDefault(); e.stopPropagation(); mutate(sectionId, (els) => moveZ(els, pid, e.key === "]" ? "forward" : "backward")); }
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId]);

  // ---- Render das alças de um elemento (só na seleção simples) ----
  const renderHandles = (el: CanvasElement) => (
    <>
      <div
        onPointerDown={(e) => startGesture("rotate", null, el, e)}
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[26px] w-5 h-5 rounded-full bg-white border border-zinc-300 shadow flex items-center justify-center cursor-grab active:cursor-grabbing"
        title="Girar"
      >
        <RotateCw className="w-3 h-3 text-zinc-600" />
      </div>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[26px] h-[26px] w-px bg-zinc-300 pointer-events-none" />
      {HANDLES.map((hd) => (
        <div
          key={hd.h}
          onPointerDown={(e) => startGesture("resize", hd.h, el, e)}
          className={cn("absolute w-2.5 h-2.5 bg-white border border-zinc-400 rounded-sm shadow-sm", hd.pos)}
          style={{ cursor: hd.cursor }}
        />
      ))}
    </>
  );

  const selectedEl = findElement(elements, selectedNodeId);

  // Bounding box do grupo (com offset ao vivo do arrasto de grupo).
  const selEls = elements.filter((e) => selIds.includes(e.id));
  const gm = groupMove ?? { dx: 0, dy: 0 };
  const gb =
    multi && selEls.length
      ? {
          minX: Math.min(...selEls.map((e) => e.x)) + gm.dx,
          minY: Math.min(...selEls.map((e) => e.y)) + gm.dy,
          maxX: Math.max(...selEls.map((e) => e.x + e.w)) + gm.dx,
          maxY: Math.max(...selEls.map((e) => e.y + e.h)) + gm.dy,
        }
      : null;

  return (
    <div className="select-none">
      {/* Toolbar: adicionar elementos */}
      <div className="flex justify-center mb-3">
        <div className="inline-flex items-center gap-1 p-1 bg-zinc-900 text-white rounded-2xl shadow-lg">
          {canvasElementTypes.map((reg) => {
            const Icon = reg.icon;
            return (
              <button
                key={reg.type}
                onClick={() => addEl(reg.type)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold hover:bg-white/15 transition-colors"
                title={`Adicionar ${reg.label}`}
              >
                <Icon className="w-3.5 h-3.5" /> {reg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Artboard */}
      <div
        ref={artboardRef}
        onPointerDown={(e) => { if (e.target === artboardRef.current) startMarquee(e); }}
        className="relative w-full bg-white outline-dashed outline-1 outline-zinc-200"
        style={{ aspectRatio: `${DW} / ${effH}`, containerType: "inline-size", ...background }}
      >
        {grid > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
              backgroundSize: `${(grid / DW) * 100}cqw ${(grid / DW) * 100}cqw`,
            }}
          />
        )}
        {elements.map((el) => {
          const isSel = selIds.includes(el.id);
          const isPrimary = el.id === selectedNodeId;
          const isEditing = editingId === el.id;
          let ex = el.x, ey = el.y, ew = el.w, eh = el.h, erot = el.rotation;
          if (drag && drag.id === el.id) { ex = drag.x; ey = drag.y; ew = drag.w; eh = drag.h; erot = drag.rotation; }
          else if (groupMove && isSel) { ex = el.x + groupMove.dx; ey = el.y + groupMove.dy; }
          return (
            <div
              key={el.id}
              data-el-id={el.id}
              onPointerDown={(e) => onElementPointerDown(e, el)}
              onDoubleClick={(e) => onElementDoubleClick(e, el)}
              className={cn("absolute", isSel && "z-[1000]")}
              style={{
                left: `${(ex / DW) * 100}%`,
                top: `${(ey / effH) * 100}%`,
                width: `${(ew / DW) * 100}%`,
                height: `${(eh / effH) * 100}%`,
                transform: `rotate(${erot}deg)`,
                opacity: el.opacity ?? 1,
                cursor: el.locked ? "default" : isEditing ? "text" : "move",
                touchAction: "none",
              }}
            >
              <div
                className={cn(
                  "w-full h-full",
                  isPrimary && !multi
                    ? "outline outline-2 outline-zinc-900"
                    : isSel
                      ? "outline outline-2 outline-blue-500"
                      : "outline outline-1 outline-transparent hover:outline-zinc-400/60"
                )}
                style={{ outlineOffset: "1px" }}
              >
                <CanvasElementRenderer element={el} designWidth={DW} editor />
              </div>
              {!multi && isPrimary && !isEditing && !el.locked && renderHandles(el)}
            </div>
          );
        })}

        {/* Caixa do grupo (multi-seleção) */}
        {gb && (
          <div
            className="absolute border-2 border-blue-500/70 pointer-events-none z-[1050]"
            style={{ left: `${(gb.minX / DW) * 100}%`, top: `${(gb.minY / effH) * 100}%`, width: `${((gb.maxX - gb.minX) / DW) * 100}%`, height: `${((gb.maxY - gb.minY) / effH) * 100}%` }}
          />
        )}

        {/* Linhas-guia de snapping */}
        {guides.map((g, i) =>
          g.axis === "x" ? (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-rose-500 pointer-events-none z-[1100]" style={{ left: `${(g.pos / DW) * 100}%` }} />
          ) : (
            <div key={i} className="absolute left-0 right-0 h-px bg-rose-500 pointer-events-none z-[1100]" style={{ top: `${(g.pos / effH) * 100}%` }} />
          )
        )}

        {/* Retângulo do marquee */}
        {marquee && (
          <div
            className="absolute bg-blue-500/10 border border-blue-500/60 pointer-events-none z-[1150]"
            style={{ left: `${(marquee.x / DW) * 100}%`, top: `${(marquee.y / effH) * 100}%`, width: `${(marquee.w / DW) * 100}%`, height: `${(marquee.h / effH) * 100}%` }}
          />
        )}

        {/* Barra de ações — seleção simples */}
        {selectedEl && !multi && !editingId && (
          <div className="absolute top-2 right-2 z-[1200] flex items-center gap-0.5 p-1 bg-zinc-900 text-white rounded-xl shadow-lg">
            <button onClick={() => dupSelected(selectedEl)} className="p-1.5 rounded-lg hover:bg-white/15" title="Duplicar"><Copy className="w-3.5 h-3.5" /></button>
            <button onClick={() => mutate(sectionId, (cur) => moveZ(cur, selectedEl.id, "front"))} className="p-1.5 rounded-lg hover:bg-white/15" title="Trazer para frente"><BringToFront className="w-3.5 h-3.5" /></button>
            <button onClick={() => mutate(sectionId, (cur) => moveZ(cur, selectedEl.id, "back"))} className="p-1.5 rounded-lg hover:bg-white/15" title="Enviar para trás"><SendToBack className="w-3.5 h-3.5" /></button>
            <button onClick={() => mutate(sectionId, (cur) => setTransform(cur, selectedEl.id, { locked: !selectedEl.locked }))} className="p-1.5 rounded-lg hover:bg-white/15" title={selectedEl.locked ? "Desbloquear" : "Bloquear"}>
              {selectedEl.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <div className="w-px h-4 bg-white/20 mx-0.5" />
            <button onClick={() => { mutate(sectionId, (cur) => removeElement(cur, selectedEl.id)); selectNode(null); }} className="p-1.5 rounded-lg hover:bg-red-500" title="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Barra de ações — grupo (multi-seleção) */}
        {multi && !editingId && (
          <div className="absolute top-2 right-2 z-[1200] flex items-center gap-0.5 p-1 bg-zinc-900 text-white rounded-xl shadow-lg">
            <span className="text-[10px] font-bold px-1 text-white/70">{selIds.length}</span>
            <div className="w-px h-4 bg-white/20 mx-0.5" />
            {ALIGN_BTNS.map((b) => (
              <button key={b.axis} onClick={() => alignGroup(b.axis)} title={b.title} className="w-6 h-6 rounded-lg text-[10px] font-bold hover:bg-white/15">{b.lbl}</button>
            ))}
            {selIds.length >= 3 && (
              <>
                <div className="w-px h-4 bg-white/20 mx-0.5" />
                <button onClick={() => distributeGroup("h")} title="Distribuir na horizontal" className="w-6 h-6 rounded-lg text-[13px] hover:bg-white/15">↔</button>
                <button onClick={() => distributeGroup("v")} title="Distribuir na vertical" className="w-6 h-6 rounded-lg text-[13px] hover:bg-white/15">↕</button>
              </>
            )}
            <div className="w-px h-4 bg-white/20 mx-0.5" />
            <button onClick={duplicateGroup} className="p-1.5 rounded-lg hover:bg-white/15" title="Duplicar grupo"><Copy className="w-3.5 h-3.5" /></button>
            <button onClick={deleteGroup} className="p-1.5 rounded-lg hover:bg-red-500" title="Excluir grupo"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Vazio */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-zinc-300 font-medium">Tela vazia — adicione um elemento acima</p>
          </div>
        )}

        {/* Alça para arrastar a altura da tela */}
        <div
          onPointerDown={startHeightDrag}
          className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-12 h-2.5 rounded-full bg-white border border-zinc-300 shadow cursor-ns-resize z-[1200]"
          title="Arrastar altura da tela"
        />
      </div>

      <p className="text-center text-[10px] text-zinc-400 mt-2">
        Arraste para mover · Shift+clique ou arraste no vazio para selecionar vários · duplo-clique no texto para editar
      </p>
    </div>
  );
}
