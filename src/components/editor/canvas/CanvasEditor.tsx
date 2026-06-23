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
import { resizeBox, angleFromCenter, snapAngle, snapTo, type ResizeHandle, type Box } from "./transform";
import { Copy, Trash2, Lock, Unlock, BringToFront, SendToBack, RotateCw } from "lucide-react";

interface Props {
  sectionId: string;
  designWidth: number;
  height: number;
  elements: CanvasElement[];
}

type LiveTransform = { id: string; x: number; y: number; w: number; h: number; rotation: number };
type Guide = { axis: "x" | "y"; pos: number };

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

export function CanvasEditor({ sectionId, designWidth: DW, height: H, elements }: Props) {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);
  const mutate = useEditorStore((s) => s.mutateCanvasElements);

  const artboardRef = useRef<HTMLDivElement | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const editingRef = useRef<HTMLElement | null>(null);

  const [drag, setDrag] = useState<LiveTransform | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

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
      y: Math.round((H - h) / 2),
      w,
      h,
      rotation: 0,
      opacity: 1,
      props: JSON.parse(JSON.stringify(reg.defaultProps)),
    };
    mutate(sectionId, (cur) => addElement(cur, el));
    selectNode(el.id);
  };

  // ---- Início de um gesto (mover / redimensionar / girar) ----
  const startGesture = (mode: Gesture["mode"], handle: ResizeHandle | null, el: CanvasElement, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = artboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = rect.width / DW;
    const scaleY = rect.height / H;
    const start = { x: el.x, y: el.y, w: el.w, h: el.h, rotation: el.rotation };
    gesture.current = {
      mode,
      handle,
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      scaleX,
      scaleY,
      cx: rect.left + (el.x + el.w / 2) * scaleX,
      cy: rect.top + (el.y + el.h / 2) * scaleY,
      start,
      live: { id: el.id, ...start },
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
      let nx = g.start.x + dx;
      let ny = g.start.y + dy;
      const nextGuides: Guide[] = [];
      // Snapping do eixo X: borda esquerda, centro, borda direita.
      const sx = snapTo(nx, [0, (DW - g.start.w) / 2, DW - g.start.w], SNAP);
      if (sx.guide != null) { nx = sx.value; nextGuides.push({ axis: "x", pos: nx + g.start.w / 2 }); }
      const sy = snapTo(ny, [0, (H - g.start.h) / 2, H - g.start.h], SNAP);
      if (sy.guide != null) { ny = sy.value; nextGuides.push({ axis: "y", pos: ny + g.start.h / 2 }); }
      g.live = { id: g.id, ...g.start, x: Math.round(nx), y: Math.round(ny) };
      setGuides(nextGuides);
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
      // Só efetiva (e empilha histórico) se houve mudança real — evita poluir o undo num clique.
      const changed = s.x !== l.x || s.y !== l.y || s.w !== l.w || s.h !== l.h || s.rotation !== l.rotation;
      if (changed) mutate(sectionId, (els) => setTransform(els, g.id, { x: l.x, y: l.y, w: l.w, h: l.h, rotation: l.rotation }));
    }
    gesture.current = null;
    setDrag(null);
    setGuides([]);
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

  // ---- Atalhos de teclado (capture, p/ suprimir os globais quando há elemento) ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement;
      const editable = ae instanceof HTMLElement && ae.isContentEditable;
      if (ae?.tagName === "INPUT" || ae?.tagName === "TEXTAREA" || editable) return;
      const st = useEditorStore.getState();
      if (st.selectedSectionId !== sectionId) return;
      const id = st.selectedNodeId;

      if (e.key === "Escape") {
        if (id) { e.preventDefault(); e.stopPropagation(); st.selectNode(null); }
        return;
      }
      if (!id) return;
      const els = getEls();
      const el = findElement(els, id);
      if (!el) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault(); e.stopPropagation();
        mutate(sectionId, (cur) => removeElement(cur, id));
        st.selectNode(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault(); e.stopPropagation();
        const copy: CanvasElement = { ...JSON.parse(JSON.stringify(el)), id: genElId(), x: el.x + 16, y: el.y + 16 };
        mutate(sectionId, (cur) => addElement(cur, copy));
        st.selectNode(copy.id);
      } else if (e.key.startsWith("Arrow")) {
        if (el.locked) return;
        e.preventDefault(); e.stopPropagation();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        mutate(sectionId, (cur) => setTransform(cur, id, { x: el.x + dx, y: el.y + dy }), `nudge:${id}`);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "]" || e.key === "[")) {
        e.preventDefault(); e.stopPropagation();
        mutate(sectionId, (cur) => moveZ(cur, id, e.key === "]" ? "forward" : "backward"));
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId]);

  // ---- Ações da barra de seleção ----
  const dupSelected = (el: CanvasElement) => {
    const copy: CanvasElement = { ...JSON.parse(JSON.stringify(el)), id: genElId(), x: el.x + 16, y: el.y + 16 };
    mutate(sectionId, (cur) => addElement(cur, copy));
    selectNode(copy.id);
  };

  const eff = (el: CanvasElement): LiveTransform | CanvasElement => (drag && drag.id === el.id ? drag : el);

  // ---- Render de uma alça ----
  const renderHandles = (el: CanvasElement) => (
    <>
      {/* Alça de rotação */}
      <div
        onPointerDown={(e) => startGesture("rotate", null, el, e)}
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[26px] w-5 h-5 rounded-full bg-white border border-zinc-300 shadow flex items-center justify-center cursor-grab active:cursor-grabbing"
        title="Girar"
      >
        <RotateCw className="w-3 h-3 text-zinc-600" />
      </div>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[26px] h-[26px] w-px bg-zinc-300 pointer-events-none" />
      {/* Alças de resize */}
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
        onPointerDown={(e) => { if (e.target === artboardRef.current) selectNode(null); }}
        className="relative w-full bg-white outline-dashed outline-1 outline-zinc-200"
        style={{ aspectRatio: `${DW} / ${H}`, containerType: "inline-size" }}
      >
        {elements.map((el) => {
          const t = eff(el);
          const selected = el.id === selectedNodeId;
          const isEditing = editingId === el.id;
          return (
            <div
              key={el.id}
              data-el-id={el.id}
              onPointerDown={(e) => {
                if (isEditing) return;
                selectNode(el.id);
                if (!el.locked) startGesture("move", null, el, e);
                else e.stopPropagation();
              }}
              onDoubleClick={(e) => onElementDoubleClick(e, el)}
              className={cn("absolute", selected && "z-[1000]")}
              style={{
                left: `${(t.x / DW) * 100}%`,
                top: `${(t.y / H) * 100}%`,
                width: `${(t.w / DW) * 100}%`,
                height: `${(t.h / H) * 100}%`,
                transform: `rotate(${t.rotation}deg)`,
                opacity: el.opacity ?? 1,
                cursor: el.locked ? "default" : isEditing ? "text" : "move",
                touchAction: "none",
              }}
            >
              <div
                className={cn(
                  "w-full h-full",
                  selected ? "outline outline-2 outline-zinc-900" : "outline outline-1 outline-transparent hover:outline-zinc-400/60"
                )}
                style={{ outlineOffset: "1px" }}
              >
                <CanvasElementRenderer element={el} designWidth={DW} />
              </div>
              {selected && !isEditing && renderHandles(el)}
            </div>
          );
        })}

        {/* Linhas-guia de snapping */}
        {guides.map((g, i) =>
          g.axis === "x" ? (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-rose-500 pointer-events-none z-[1100]" style={{ left: `${(g.pos / DW) * 100}%` }} />
          ) : (
            <div key={i} className="absolute left-0 right-0 h-px bg-rose-500 pointer-events-none z-[1100]" style={{ top: `${(g.pos / H) * 100}%` }} />
          )
        )}

        {/* Barra de ações do elemento selecionado */}
        {selectedEl && !editingId && (
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

        {/* Vazio */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-zinc-300 font-medium">Tela vazia — adicione um elemento acima</p>
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-zinc-400 mt-2">
        Arraste para mover · alças para redimensionar/girar · duplo-clique no texto para editar
      </p>
    </div>
  );
}
