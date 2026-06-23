"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { ArrowLeft, Save, Globe, Loader2, Check, LayoutPanelLeft, AlertTriangle, Undo2, Redo2, Monitor, Tablet, Smartphone, Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SectionInserter } from "@/components/editor/inserter/SectionInserter";
import { LayerPanel } from "@/components/editor/LayerPanel";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { ColorPalettePanel } from "@/components/editor/ColorPalettePanel";
import { StudioSidebar, type StudioTab } from "@/components/editor/StudioSidebar";
import { useEditorStore, type DragState, type PageSection } from "@/stores/editorStore";
import { sectionRegistry } from "@/components/editor/sections/registry";
import { fetchSavedBlocks } from "@/utils/savedBlocks";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { FranchiseProvider } from "@/context/FranchiseContext";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

type Tab = StudioTab;

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
  const { sections, setSections, isDirty, isSaving, setSaving, theme, setTheme, selectedSectionId, removeSection, undo, redo, past, future, clearHistory, canvasMode, setCanvasMode, viewport, setViewport, addSectionAtIndex, reorderSections, dragState, setDragState, openInserter, setSavedBlocks } = useEditorStore();
  const isPreview = canvasMode === "preview";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
  const [activeTab, setActiveTab] = useState<Tab>("layers");
  const [isPublished, setIsPublished] = useState(false);
  const [publishedSections, setPublishedSections] = useState<PageSection[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [now, setNow] = useState(0); // ts atual p/ "salvo há X"; 0 até o 1º tick
  const supabase = createClient();
  const saveLockRef = useRef<Promise<unknown>>(Promise.resolve());
  const autoOpenedRef = useRef(false);

  // Atualiza o rótulo de "salvo há X" periodicamente.
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(i);
  }, []);

  const savedAgoLabel = () => {
    if (!lastSavedAt) return "Tudo salvo";
    const mins = Math.floor((now - lastSavedAt) / 60000);
    if (mins < 1) return "Salvo agora";
    if (mins === 1) return "Salvo há 1 min";
    if (mins < 60) return `Salvo há ${mins} min`;
    return "Tudo salvo";
  };

  // Há rascunho com alterações ainda não publicadas?
  const hasUnpublishedChanges = useMemo(
    () => JSON.stringify(sections) !== JSON.stringify(publishedSections),
    [sections, publishedSections]
  );

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
        setPublishedSections(layoutData.published_sections || []);
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

      setSavedBlocks(await fetchSavedBlocks());

      clearHistory();
      setLoading(false);
    }
    load();
  }, [supabase, setSections, setTheme, clearHistory, setSavedBlocks]);

  // Página vazia → abre a galeria de seções automaticamente (uma vez) para
  // deixar óbvio como começar a montar o layout.
  useEffect(() => {
    if (loading || autoOpenedRef.current) return;
    if (sections.length === 0) {
      autoOpenedRef.current = true;
      openInserter(null);
    }
  }, [loading, sections.length, openInserter]);

  const handleSave = useCallback(
    (action: "save" | "publish" | "unpublish" = "save") => {
      // Serializa saves: cada chamada espera a anterior terminar (evita corridas
      // entre o auto-save e o publicar/despublicar).
      const run = saveLockRef.current.catch(() => {}).then(async () => {
      setSaving(true);
      try {
        // `sections` é sempre o rascunho. Só "publish" promove o rascunho para
        // `published_sections` (versão lida pela landing pública).
        const payload: Record<string, unknown> = {
          id: "home",
          name: "Página Principal",
          sections,
          updated_at: new Date().toISOString(),
        };

        if (action === "publish") {
          payload.published_sections = sections;
          payload.is_published = true;
        } else if (action === "unpublish") {
          payload.is_published = false;
        }

        const { error } = await supabase
          .from("page_layouts")
          .upsert(payload);

        if (error) {
          console.error("Erro ao salvar layout:", error);
          addToast("Erro ao salvar. Verifique o console.", "error");
          return;
        }

        if (action === "publish") {
          setIsPublished(true);
          setPublishedSections(JSON.parse(JSON.stringify(sections)));
          addToast("Site publicado com sucesso.");
        } else if (action === "unpublish") {
          setIsPublished(false);
          addToast("Site despublicado. Não está mais visível ao público.");
        }

        // Salva o tema só quando ele realmente mudou — num único upsert em lote.
        if (useEditorStore.getState().isThemeDirty && Object.keys(theme).length > 0) {
          const THEME_LABELS: Record<string, string> = {
            dashboard_primary_color: "Cor Primária Admin",
            dashboard_bg_color: "Cor de Fundo Admin",
            theme_primary_color: "Cor Primária",
            theme_bg_color: "Cor de Fundo",
          };
          const rows = Object.entries(theme).map(([key, value]) => ({
            key,
            value,
            group: "aparencia",
            label: THEME_LABELS[key] ?? "Configuração de Tema",
            type: "color",
            updated_at: new Date().toISOString(),
          }));

          const { error: themeError } = await supabase.from("site_settings").upsert(rows);
          if (themeError) {
            console.error("Erro ao salvar tema:", themeError);
            addToast("Erro ao salvar o tema. Verifique o console.", "error");
            return;
          }
          useEditorStore.getState().setThemeDirty(false);
        }

        useEditorStore.getState().setDirty(false);
        const savedAt = Date.now();
        setLastSavedAt(savedAt);
        setNow(savedAt);
      } finally {
        setSaving(false);
      }
      });
      saveLockRef.current = run;
      return run;
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

  // Avisa antes de fechar/recarregar a aba se houver algo pendente.
  useEffect(() => {
    if (!isDirty && !isSaving) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, isSaving]);

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

      // Ctrl/Cmd+D — duplica a seção selecionada
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        const { selectedSectionId: currentId, duplicateSection } = useEditorStore.getState();
        if (currentId && currentId !== "global_theme") {
          e.preventDefault();
          duplicateSection(currentId);
        }
      }

      // Esc — sai do preview ou limpa a seleção
      if (e.key === "Escape") {
        const state = useEditorStore.getState();
        if (state.canvasMode === "preview") {
          state.setCanvasMode("edit");
        } else if (state.selectedSectionId) {
          state.selectSection(null);
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const activeElement = document.activeElement;
        if (activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA" || activeElement?.getAttribute("contenteditable") === "true") return;

        const { selectedSectionId: currentId } = useEditorStore.getState();
        if (currentId && currentId !== "global_theme") {
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
                    aria-label={`Visualizar em ${v}`}
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

            {/* Status de publicação */}
            {(() => {
              const pub = !isPublished
                ? { cls: "bg-zinc-100 text-zinc-500", dot: "bg-zinc-400", label: "Não publicado" }
                : hasUnpublishedChanges
                  ? { cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500", label: "Alterações não publicadas" }
                  : { cls: "bg-green-50 text-green-700", dot: "bg-green-500", label: "Publicado e atualizado" };
              return (
                <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", pub.cls)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", pub.dot)} />
                  {pub.label}
                </span>
              );
            })()}

            <div className="h-6 w-px bg-text-100 mx-2" />
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={past.length === 0}
                aria-label="Desfazer"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Desfazer (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={future.length === 0}
                aria-label="Refazer"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Refazer (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            <div className="h-6 w-px bg-text-100 mx-1" />
            <button
              onClick={() => openInserter(null)}
              title="Adicionar uma nova seção"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white hover:bg-primary transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Seção
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Device switcher */}
            <div className="flex items-center gap-0.5 bg-white/5 rounded-xl p-1">
              {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([v, Icon]) => (
                <button
                  key={v}
                  onClick={() => setViewport(v)}
                  aria-label={`Visualizar em ${v}`}
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
                  {(status === "saved" || status === "idle") && <><Check className="w-3.5 h-3.5" /> {savedAgoLabel()}</>}
                </button>
              );
            })()}

            {/* Despublicar — só quando está no ar */}
            {isPublished && (
              <button
                onClick={async () => {
                  const ok = await confirm({
                    title: "Despublicar site?",
                    message: "O site deixará de ficar visível para o público. O rascunho é mantido.",
                    variant: "danger",
                    confirmLabel: "Despublicar",
                  });
                  if (ok) handleSave("unpublish");
                }}
                disabled={isSaving}
                title="Tirar o site do ar"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-text-500 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <EyeOff className="w-3.5 h-3.5" /> Despublicar
              </button>
            )}

            {(() => {
              // Botão principal: publicar (primeira vez) ou publicar alterações.
              const upToDate = isPublished && !hasUnpublishedChanges;
              return (
                <button
                  onClick={() => handleSave("publish")}
                  disabled={isSaving || upToDate}
                  title={upToDate ? "Site já está atualizado no ar" : "Publicar a versão atual para o público"}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                    upToDate
                      ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                      : "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
                  )}
                >
                  <Globe className="w-4 h-4" />
                  {!isPublished ? "Publicar Site" : hasUnpublishedChanges ? "Publicar Alterações" : "Publicado"}
                </button>
              );
            })()}
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
          <StudioSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            collapsed={leftSidebarCollapsed}
            setCollapsed={setLeftSidebarCollapsed}
            hidden={isPreview}
          />

          {/* Focused Side Panel Content */}
          <motion.div
            initial={false}
            animate={{ width: leftSidebarCollapsed ? 0 : 360 }}
            className={cn("flex-shrink-0 z-40 shadow-[20px_0_40px_rgba(0,0,0,0.02)] overflow-hidden flex bg-white relative", isPreview && "hidden")}
          >
            <div className="w-[360px] h-full overflow-y-auto custom-scrollbar">
              {activeTab === "layers" && <LayerPanel />}
              {activeTab === "palette" && <ColorPalettePanel />}
            </div>
          </motion.div>

          {/* Main Canvas Area */}
          <div className="flex-1 overflow-hidden bg-[#0d0d10] flex flex-col relative">
            <EditorCanvas />

            {/* Right Panel Toggle Button - Floating */}
            <button
              onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
              aria-label={rightSidebarCollapsed ? "Mostrar painel de propriedades" : "Ocultar painel de propriedades"}
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
      <SectionInserter />
      <ConfirmDialog state={confirmState} onRespond={respondConfirm} tone="light" />
    </FranchiseProvider>
  );
}
