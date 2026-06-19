"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Save, Globe, Loader2, Check, LayoutPanelLeft, PlusCircle, Layers, Palette, AlertTriangle, Undo2, Redo2, Monitor, Tablet, Smartphone, Eye, Pencil } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SectionLibrary } from "@/components/editor/SectionLibrary";
import { LayerPanel } from "@/components/editor/LayerPanel";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { ColorPalettePanel } from "@/components/editor/ColorPalettePanel";
import { useEditorStore, type DragState, type PageSection } from "@/stores/editorStore";
import { sectionRegistry } from "@/components/editor/sections/registry";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { FranchiseProvider } from "@/context/FranchiseContext";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

type Tab = "library" | "layers" | "palette";

type Toast = { id: number; message: string; type: "success" | "error" };

// Ghost (preview) exibido sob o cursor durante o arraste
function DragGhost({ dragState, sections }: { dragState: DragState; sections: PageSection[] }) {
  const type = dragState.kind === "new" ? dragState.sectionType : sections.find((s) => s.id === dragState.sectionId)?.type;
  const entry = type ? sectionRegistry[type] : null;
  if (!entry) return null;
  const Icon = entry.icon;
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 text-white rounded-2xl shadow-2xl border border-white/10 cursor-grabbing">
      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[12px] font-bold">{entry.label}</span>
    </div>
  );
}


export default function FocusedEditorPage() {
  const { sections, setSections, isDirty, isSaving, setSaving, theme, setTheme, selectSection, selectedSectionId, removeSection, undo, redo, past, future, clearHistory, canvasMode, setCanvasMode, viewport, setViewport, addSectionAtIndex, reorderSections, dragState, setDragState } = useEditorStore();
  const isPreview = canvasMode === "preview";

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragState | undefined;
    if (data) setDragState(data);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDragState(null);
    if (!over) return;
    const data = active.data.current as DragState | undefined;
    if (!data) return;
    const overId = String(over.id);

    if (data.kind === "new" && data.sectionType) {
      // Solto numa zona de inserção "gap:<index>" → insere na posição; senão, anexa
      const index = overId.startsWith("gap:") ? parseInt(overId.slice(4), 10) : sections.length;
      addSectionAtIndex(data.sectionType, index);
    } else if (data.kind === "reorder") {
      if (active.id !== over.id && !overId.startsWith("gap:")) {
        const from = sections.findIndex((s) => s.id === active.id);
        const to = sections.findIndex((s) => s.id === over.id);
        if (from >= 0 && to >= 0) reorderSections(arrayMove(sections, from, to));
      }
    }
  };
  const { confirm, confirmState, respondConfirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<Tab>("library");
  const [isPublished, setIsPublished] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const supabase = createClient();

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    async function load() {
      const { data: layoutData } = await supabase
        .from("page_layouts")
        .select("*")
        .eq("id", "home")
        .single();

      if (layoutData) {
        setSections(layoutData.sections || []);
        setIsPublished(layoutData.is_published ?? false);
      }

      const { data: themeData } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("group", "aparencia");

      if (themeData) {
        const themeMap: Record<string, string> = {};
        themeData.forEach(item => {
          themeMap[item.key] = item.value;
        });
        setTheme(themeMap);
      }

      clearHistory();
      setLoading(false);
    }
    load();
  }, [supabase, setSections, setTheme, clearHistory]);

  const handleSave = useCallback(
    async (publish?: boolean) => {
      setSaving(true);
      try {
        const payload: Record<string, unknown> = {
          sections,
          updated_at: new Date().toISOString(),
        };

        if (publish !== undefined) {
          payload.is_published = publish;
          setIsPublished(publish);
        }

        const { error } = await supabase
          .from("page_layouts")
          .upsert({ id: "home", name: "Página Principal", ...payload });

        if (error) {
          console.error("Erro ao salvar layout:", error);
          addToast("Erro ao salvar. Verifique o console.", "error");
          return;
        }

        if (Object.keys(theme).length > 0) {
          const themeUpdates = Object.entries(theme).map(([key, value]) => {
            let label = "Configuração de Tema";
            const type = "color";
            if (key === "dashboard_primary_color") label = "Cor Primária Admin";
            if (key === "dashboard_bg_color") label = "Cor de Fundo Admin";
            if (key === "theme_primary_color") label = "Cor Primária";
            if (key === "theme_bg_color") label = "Cor de Fundo";

            return supabase
              .from("site_settings")
              .upsert({
                key,
                value,
                group: "aparencia",
                label,
                type,
                updated_at: new Date().toISOString()
              });
          });

          await Promise.all(themeUpdates);
        }

        useEditorStore.getState().setDirty(false);
        setLastSavedAt(Date.now());
      } finally {
        setSaving(false);
      }
    },
    [sections, theme, supabase, setSaving, addToast]
  );

  // Auto-save: salva automaticamente após inatividade quando há mudanças
  useEffect(() => {
    if (loading || !isDirty || isSaving) return;
    const t = setTimeout(() => {
      handleSave();
    }, 1500);
    return () => clearTimeout(t);
  }, [isDirty, isSaving, loading, sections, theme, handleSave]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const activeElement = document.activeElement;
        if (activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA" || activeElement?.getAttribute("contenteditable") === "true") return;

        const { selectedSectionId: currentId } = useEditorStore.getState();
        if (currentId) {
          e.preventDefault();
          (async () => {
            const ok = await confirm({
              title: "Remover seção?",
              message: "Esta ação não pode ser desfeita.",
              variant: "danger",
              confirmLabel: "Remover",
            });
            if (ok) removeSection(currentId);
          })();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave, undo, redo, confirm, removeSection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-zinc-200 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Carregando Studio</span>
        </div>
      </div>
    );
  }

  const adminThemeStyles = {
    '--theme-primary': "#18181B",
    '--theme-primary-dark': "#000000",
    '--theme-primary-light': "#3F3F46",
    '--theme-primary-soft': "#F4F4F5",
    '--theme-primary-bg': "#FAFAFA",
    '--theme-surface-50': "#FFFFFF",
  } as React.CSSProperties;

  return (
    <FranchiseProvider>
      <div
        className="flex flex-col h-screen bg-white overflow-hidden selection:bg-zinc-900 selection:text-white"
        style={adminThemeStyles}
      >
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: 40, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 40, scale: 0.9 }}
                className={cn("flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-bold pointer-events-auto",
                  t.type === "success" ? "bg-white border-green-100 text-zinc-900" : "bg-red-50 border-red-100 text-red-700")}>
                {t.type === "success" ? <Check className="w-4 h-4 text-green-500 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                <span className="text-[12px]">{t.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Floating Preview Bar */}
        <AnimatePresence>
          {isPreview && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[250] flex items-center gap-3 px-3 py-2 bg-zinc-900 text-white rounded-2xl shadow-2xl border border-white/10"
            >
              <div className="flex items-center gap-0.5 bg-white/5 rounded-xl p-1">
                {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([v, Icon]) => (
                  <button
                    key={v}
                    onClick={() => setViewport(v)}
                    title={`Visualizar em ${v}`}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      viewport === v ? "bg-indigo-500 text-white" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <div className="w-px h-5 bg-white/15" />
              <button
                onClick={() => setCanvasMode("edit")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" /> Sair do preview
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header */}
        <div className={cn("h-14 border-b border-zinc-100 bg-white flex items-center justify-between px-5 flex-shrink-0 z-50 shadow-sm", isPreview && "hidden")}>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/editor"
              onClick={async (e) => {
                if (isDirty) {
                  e.preventDefault();
                  const ok = await confirm({
                    title: "Sair sem salvar?",
                    message: "Há alterações não salvas. Deseja sair mesmo assim?",
                    variant: "danger",
                    confirmLabel: "Sair",
                  });
                  if (ok) window.location.href = "/admin/editor";
                }
              }}
              className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span>Sair do Editor</span>
            </Link>
            <div className="h-6 w-px bg-text-100" />
            <div className="flex flex-col">
              <h1 className="text-xs font-black text-text-900 uppercase tracking-widest leading-none">Ambiente Focado</h1>
              <p className="text-[10px] text-text-400 font-bold mt-1">Editando: Home Page</p>
            </div>

            <div className="h-6 w-px bg-text-100 mx-2" />
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={past.length === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Desfazer (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={future.length === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Refazer (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Device switcher */}
            <div className="flex items-center gap-0.5 bg-white/5 rounded-xl p-1">
              {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([v, Icon]) => (
                <button
                  key={v}
                  onClick={() => setViewport(v)}
                  title={`Visualizar em ${v}`}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    viewport === v ? "bg-indigo-500 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Preview toggle */}
            <button
              onClick={() => setCanvasMode("preview")}
              title="Visualizar como visitante"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-500 hover:text-text-900 hover:bg-surface-100 transition-all"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>

            {(() => {
              const status = isSaving ? "saving" : isDirty ? "unsaved" : lastSavedAt ? "saved" : "idle";
              return (
                <button
                  onClick={() => handleSave()}
                  disabled={isSaving || !isDirty}
                  title={isDirty ? "Salvar agora" : "Tudo salvo (salvamento automático ativo)"}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    status === "saving" && "bg-surface-100 text-text-500",
                    status === "unsaved" && "bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer",
                    status === "saved" && "bg-green-50 text-green-700",
                    status === "idle" && "bg-surface-100 text-text-400"
                  )}
                >
                  {status === "saving" && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando…</>}
                  {status === "unsaved" && <><Save className="w-3.5 h-3.5" /> Salvar agora</>}
                  {(status === "saved" || status === "idle") && <><Check className="w-3.5 h-3.5" /> Tudo salvo</>}
                </button>
              );
            })()}

            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                isPublished
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
              )}
            >
              <Globe className="w-4 h-4" />
              {isPublished ? "Publicado" : "Publicar Site"}
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDragState(null)}
        >
        <div className="flex flex-1 overflow-hidden relative">
          {/* Studio Sidebar Nav */}
          <div className={cn("w-16 border-r border-text-100 bg-white flex flex-col items-center py-8 gap-6 z-50 shadow-[1px_0_0_rgba(0,0,0,0.05)]", isPreview && "hidden")}>
            {/* Biblioteca */}
            <div className="flex flex-col items-center gap-1 group">
              <button
                onClick={() => {
                  setActiveTab("library");
                  setLeftSidebarCollapsed(false);
                  if (selectedSectionId === "global_theme") selectSection(null);
                }}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                  activeTab === "library" && !leftSidebarCollapsed
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 scale-105"
                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                )}
                title="Biblioteca de Seções"
              >
                <PlusCircle className={cn("w-[14px] h-[14px] transition-transform", activeTab === "library" && !leftSidebarCollapsed ? "scale-105" : "group-hover:scale-105")} />
                {activeTab === "library" && !leftSidebarCollapsed && (
                  <motion.div layoutId="nav-pill" className="absolute -left-5 w-1 h-5 bg-zinc-900 rounded-r-full shadow-[4px_0_15px_rgba(0,0,0,0.1)]" />
                )}
              </button>
              <span className={cn(
                "text-[7px] font-normal uppercase tracking-tight transition-colors duration-300",
                activeTab === "library" && !leftSidebarCollapsed ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"
              )}>
                Adicionar
              </span>
            </div>

            {/* Camadas */}
            <div className="flex flex-col items-center gap-1 group">
              <button
                onClick={() => {
                  setActiveTab("layers");
                  setLeftSidebarCollapsed(false);
                  if (selectedSectionId === "global_theme") selectSection(null);
                }}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                  activeTab === "layers" && !leftSidebarCollapsed
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 scale-105"
                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                )}
                title="Estrutura de Camadas"
              >
                <Layers className={cn("w-[14px] h-[14px] transition-transform", activeTab === "layers" && !leftSidebarCollapsed ? "scale-105" : "group-hover:scale-105")} />
                {activeTab === "layers" && !leftSidebarCollapsed && (
                  <motion.div layoutId="nav-pill" className="absolute -left-5 w-1 h-5 bg-zinc-900 rounded-r-full shadow-[4px_0_15px_rgba(0,0,0,0.1)]" />
                )}
              </button>
              <span className={cn(
                "text-[7px] font-normal uppercase tracking-tight transition-colors duration-300",
                activeTab === "layers" && !leftSidebarCollapsed ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"
              )}>
                Camadas
              </span>
            </div>

            {/* Paleta */}
            <div className="flex flex-col items-center gap-1 group">
              <button
                onClick={() => {
                  setActiveTab("palette");
                  setLeftSidebarCollapsed(false);
                  if (selectedSectionId === "global_theme") selectSection(null);
                }}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                  activeTab === "palette" && !leftSidebarCollapsed
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 scale-105"
                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                )}
                title="Paleta Global"
              >
                <Palette className={cn("w-[14px] h-[14px] transition-transform", activeTab === "palette" && !leftSidebarCollapsed ? "scale-105" : "group-hover:scale-105")} />
                {activeTab === "palette" && !leftSidebarCollapsed && (
                  <motion.div layoutId="nav-pill" className="absolute -left-5 w-1 h-5 bg-zinc-900 rounded-r-full shadow-[4px_0_15px_rgba(0,0,0,0.1)]" />
                )}
              </button>
              <span className={cn(
                "text-[7px] font-normal uppercase tracking-tight transition-colors duration-300",
                activeTab === "palette" && !leftSidebarCollapsed ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"
              )}>
                Paleta
              </span>
            </div>

            <div className="mt-auto flex flex-col gap-6 mb-4">
              <button
                onClick={() => {
                  setLeftSidebarCollapsed(!leftSidebarCollapsed);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 transition-all border border-zinc-100"
                title={leftSidebarCollapsed ? "Expandir" : "Recolher"}
              >
                <ArrowLeft className={cn("w-3 h-3 transition-transform duration-500", leftSidebarCollapsed && "rotate-180")} />
              </button>
            </div>
          </div>

          {/* Focused Side Panel Content */}
          <motion.div
            initial={false}
            animate={{ width: leftSidebarCollapsed ? 0 : 360 }}
            className={cn("flex-shrink-0 z-40 shadow-[20px_0_40px_rgba(0,0,0,0.02)] overflow-hidden flex bg-white relative", isPreview && "hidden")}
          >
            <div className="w-[360px] h-full overflow-y-auto custom-scrollbar">
              {activeTab === "library" && <SectionLibrary />}
              {activeTab === "layers" && <LayerPanel />}
              {activeTab === "palette" && <ColorPalettePanel />}
            </div>
          </motion.div>

          {/* Main Canvas Area */}
          <div className="flex-1 overflow-hidden bg-[#0d0d10] flex flex-col relative">
            <EditorCanvas onOpenLibrary={() => { setActiveTab("library"); setLeftSidebarCollapsed(false); }} />

            {/* Right Panel Toggle Button - Floating */}
            <button
              onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
              className={cn(
                "absolute right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white border border-text-100 shadow-2xl rounded-2xl flex items-center justify-center text-text-400 hover:text-text-900 hover:scale-110 transition-all active:scale-95",
                rightSidebarCollapsed && "translate-x-2",
                isPreview && "hidden"
              )}
            >
              <LayoutPanelLeft className={cn("w-5 h-5 transition-transform", !rightSidebarCollapsed && "rotate-180")} />
            </button>
          </div>

          {/* Right Properties Panel */}
          <motion.div
            initial={false}
            animate={{ width: rightSidebarCollapsed ? 0 : 420 }}
            className={cn("flex-shrink-0 overflow-hidden border-l border-text-100 bg-white z-40 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]", isPreview && "hidden")}
          >
            <div className="w-[420px] h-full overflow-y-auto custom-scrollbar">
              <PropertiesPanel key={selectedSectionId ?? "none"} />
            </div>
          </motion.div>
        </div>
        <DragOverlay dropAnimation={null}>
          {dragState ? <DragGhost dragState={dragState} sections={sections} /> : null}
        </DragOverlay>
        </DndContext>
      </div>
      <ConfirmDialog state={confirmState} onRespond={respondConfirm} />
    </FranchiseProvider>
  );
}
