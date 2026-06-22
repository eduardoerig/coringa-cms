"use client";
import { useEditorStore, type PageSection, type DragState } from "@/stores/editorStore";
import { sectionRegistry, sectionComponentMap } from "./sections/registry";
import { GripVertical, Eye, EyeOff, Trash2, Copy, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Props { section: PageSection; index: number; isSelected: boolean; onSelect: () => void; }

export function SectionInCanvas({ section, index, isSelected, onSelect }: Props) {
  const { removeSection, toggleVisibility, duplicateSection, moveSection, sections, theme, canvasMode, selectBlock, updateSectionProps } = useEditorStore();
  const { confirm, confirmState, respondConfirm } = useConfirm();
  const editingRef = useRef<HTMLElement | null>(null);

  const handleRemove = async () => {
    const ok = await confirm({
      title: "Remover seção?",
      message: "Esta seção será removida do layout. Você pode desfazer com Ctrl+Z.",
      variant: "danger",
      confirmLabel: "Remover",
    });
    if (ok) removeSection(section.id);
  };
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    data: { kind: "reorder", sectionId: section.id } satisfies DragState,
  });
  const entry = sectionRegistry[section.type];
  const Component = sectionComponentMap[section.type];
  if (!entry || !Component) return null;

  // Modo preview: renderiza apenas seções visíveis, sem nenhum chrome do editor.
  // `.canvas-render` isola o conteúdo do site do tema dark do editor (ver admin/layout.tsx).
  if (canvasMode === "preview") {
    if (!section.visible) return null;
    return (
      <div className="canvas-render">
        <Component props={section.props} settings={theme} isEditor={false} />
      </div>
    );
  }

  const sortableStyle = { transform: CSS.Transform.toString(transform), transition };

  // Clique num elemento com data-field → seleciona aquele campo (edição por bloco)
  const handleFieldClick = (e: React.MouseEvent) => {
    e.preventDefault(); // evita navegação de links dentro da seção no editor
    const fieldEl = (e.target as HTMLElement).closest("[data-field]");
    if (!fieldEl) return;
    e.stopPropagation();
    const fieldKey = fieldEl.getAttribute("data-field");
    if (!fieldKey) return;
    const itemAttr = fieldEl.getAttribute("data-item-index");
    selectBlock({ sectionId: section.id, fieldKey, itemIndex: itemAttr != null ? Number(itemAttr) : undefined });
  };

  // Edição inline: duplo-clique num texto puro (campo text/textarea de nível superior)
  // torna o elemento editável; o valor é gravado no blur/Enter. Rich text continua no painel.
  const handleFieldDoubleClick = (e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest("[data-field]") as HTMLElement | null;
    if (!el || editingRef.current) return;
    const fieldKey = el.getAttribute("data-field");
    if (!fieldKey || el.getAttribute("data-item-index") != null) return; // só campos de nível superior
    const field = entry.fields.find((f) => f.key === fieldKey);
    if (!field || (field.type !== "text" && field.type !== "textarea")) return;
    if (el.children.length > 0) return; // só elementos de texto puro (sem ícones/filhos)

    e.preventDefault();
    e.stopPropagation();

    const isMultiline = field.type === "textarea";
    const original = el.innerText;
    editingRef.current = el;
    // "plaintext-only" onde houver suporte (Chrome/Safari); senão "true" (Firefox).
    try { el.contentEditable = "plaintext-only"; } catch { el.contentEditable = "true"; }
    if (el.contentEditable !== "plaintext-only") el.contentEditable = "true";
    el.spellcheck = false;
    el.style.outline = "2px solid rgb(24 24 27)";
    el.style.outlineOffset = "2px";
    el.style.cursor = "text";
    el.focus();
    // seleciona todo o conteúdo para substituição rápida
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    const finish = (commit: boolean) => {
      el.removeEventListener("blur", onBlur);
      el.removeEventListener("keydown", onKey);
      el.contentEditable = "false";
      el.style.outline = "";
      el.style.outlineOffset = "";
      el.style.cursor = "";
      editingRef.current = null;
      const value = el.innerText;
      if (commit) {
        updateSectionProps(section.id, { [fieldKey]: isMultiline ? value : value.trim() });
      } else {
        el.innerText = original; // cancela
      }
    };
    const onBlur = () => finish(true);
    const onKey = (ev: KeyboardEvent) => {
      ev.stopPropagation(); // impede atalhos globais (Delete/Esc/Ctrl+Z) durante a edição
      if (ev.key === "Escape") { ev.preventDefault(); finish(false); el.blur(); }
      else if (ev.key === "Enter" && !isMultiline) { ev.preventDefault(); finish(true); el.blur(); }
    };
    el.addEventListener("blur", onBlur);
    el.addEventListener("keydown", onKey);
  };

  return (
    <>
      <ConfirmDialog state={confirmState} onRespond={respondConfirm} />
      <div ref={setNodeRef} style={sortableStyle} onClick={(e) => { e.stopPropagation(); onSelect(); }} className={cn("group relative transition-all duration-300", isSelected ? "ring-[3px] ring-zinc-900 ring-offset-0 z-20" : "hover:ring-2 hover:ring-zinc-400/40", !section.visible && "opacity-40 grayscale-[0.5]", isDragging && "opacity-50 z-50")}>
        {/* Top label */}
        <AnimatePresence>
          {isSelected && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: -38 }} exit={{ opacity: 0, y: 8 }} className="absolute top-0 left-0 z-[110]">
              <div className="flex items-center gap-2 bg-zinc-900 text-white px-3 py-1.5 rounded-t-xl shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">{entry.label}</span>
                <span className="text-[9px] text-zinc-500 font-bold">#{index + 1}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden section badge */}
        {!section.visible && (
          <div className="absolute top-3 left-3 z-[60] bg-zinc-900/85 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 pointer-events-none">
            <EyeOff className="w-3 h-3" /> Oculto no site
          </div>
        )}

        {/* Floating toolbar — inside section, top-right */}
        <AnimatePresence>
          {isSelected && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute top-3 right-3 z-[110] flex flex-row gap-1 p-1.5 bg-zinc-900 text-white rounded-2xl shadow-2xl border border-white/10">
              <button {...attributes} {...listeners} onClick={(e) => e.stopPropagation()} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing touch-none" title="Arraste para reordenar"><GripVertical className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-white/20 mx-0.5 self-center" />
              <button onClick={(e) => { e.stopPropagation(); if (index > 0) moveSection(index, index - 1); }} disabled={index === 0} className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-20 transition-colors" title="Mover para cima"><ChevronUp className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); if (index < sections.length - 1) moveSection(index, index + 1); }} disabled={index === sections.length - 1} className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-20 transition-colors" title="Mover para baixo"><ChevronDown className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-white/20 mx-0.5 self-center" />
              <button onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id); }} className="p-2 rounded-xl hover:bg-white/10 transition-colors" title={section.visible ? "Ocultar" : "Mostrar"}>
                {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }} className="p-2 rounded-xl hover:bg-white/10 transition-colors" title="Duplicar"><Copy className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-white/20 mx-0.5 self-center" />
              <button onClick={(e) => { e.stopPropagation(); handleRemove(); }} className="p-2 rounded-xl hover:bg-red-500 transition-colors" title="Remover"><Trash2 className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Component */}
        <div className={cn("relative transition-all duration-300", isSelected && "rounded-sm overflow-hidden")}>
          <div
            className={cn(
              "editor-preview canvas-render",
              isSelected
                ? "pointer-events-auto [&_[data-field]:hover]:outline [&_[data-field]:hover]:outline-2 [&_[data-field]:hover]:outline-offset-2 [&_[data-field]:hover]:outline-zinc-900/50 [&_[data-field]:hover]:cursor-pointer"
                : "pointer-events-none"
            )}
            onClickCapture={isSelected ? handleFieldClick : undefined}
            onDoubleClick={isSelected ? handleFieldDoubleClick : undefined}
          >
            <Component props={section.props} settings={theme} isEditor={true} />
          </div>
          {!isSelected && <div className="absolute inset-0 z-50 cursor-pointer" />}
        </div>

        {/* Hover badge */}
        {!isSelected && (
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0 bg-white/95 backdrop-blur-sm border border-zinc-200 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 z-[60]">
            <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />
            <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{entry.label}</span>
            <span className="text-[9px] text-zinc-400">#{index + 1}</span>
          </div>
        )}
      </div>
    </>
  );
}
