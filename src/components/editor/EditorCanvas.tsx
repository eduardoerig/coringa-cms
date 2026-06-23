import { useState, useCallback } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { SectionInCanvas } from "./SectionInCanvas";
import {
  Plus,
  LayoutTemplate,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Signal,
  Wifi,
  Battery,
  Grid3X3
} from "lucide-react";
import { motion } from "framer-motion";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { generatePalette, safeCssColor, safeCssTokenId } from "@/utils/colors";
import { cn } from "@/lib/utils";

// Zoom padrão por dispositivo + persistência por viewport em localStorage.
const ZOOM_STORAGE_KEY = "coringa.editor.zoom";
const ZOOM_DEFAULTS: Record<string, number> = { desktop: 0.85, tablet: 0.7, mobile: 0.9 };

function loadZoomMap(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(ZOOM_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

// Inserção por posição: linha fina com botão "+" que aparece no hover e abre o
// inseridor (galeria) já apontando para o índice certo.
function InsertDivider({ index }: { index: number }) {
  const openInserter = useEditorStore((s) => s.openInserter);
  return (
    <div className="relative h-5 -my-2.5 z-20 flex items-center justify-center group/ins">
      <div className="absolute inset-x-10 h-px bg-primary/0 group-hover/ins:bg-primary/40 transition-colors" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          openInserter(index);
        }}
        aria-label="Inserir seção aqui"
        title="Inserir seção aqui"
        className="relative opacity-0 group-hover/ins:opacity-100 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

export function EditorCanvas() {
  const { sections, selectedSectionId, selectSection, theme, viewport, canvasMode, openInserter } = useEditorStore();
  // Zoom inicial = preferência salva para o viewport atual, ou o padrão do dispositivo.
  const [zoom, setZoomState] = useState(() => loadZoomMap()[viewport] ?? ZOOM_DEFAULTS[viewport]);
  const [showGrid, setShowGrid] = useState(true);
  const isPreview = canvasMode === "preview";

  // setZoom que persiste a escolha por viewport.
  const setZoom = useCallback(
    (updater: number | ((prev: number) => number)) => {
      setZoomState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const map = loadZoomMap();
        map[viewport] = next;
        try {
          localStorage.setItem(ZOOM_STORAGE_KEY, JSON.stringify(map));
        } catch {
          /* localStorage indisponível — ignora */
        }
        return next;
      });
    },
    [viewport]
  );

  // Ao trocar de viewport, aplica a preferência salva (ou o padrão) sem sobrescrever
  // o zoom manual do usuário — ajuste de estado durante render (padrão React).
  const [prevViewport, setPrevViewport] = useState(viewport);
  if (viewport !== prevViewport) {
    setPrevViewport(viewport);
    setZoomState(loadZoomMap()[viewport] ?? ZOOM_DEFAULTS[viewport]);
  }

  const primaryColor = safeCssColor(theme.theme_primary_color, "#2563EB");
  const surfaceBg = safeCssColor(theme.theme_bg_color, "#FAFAFA");
  const palette = generatePalette(primaryColor);
  const textHeading = safeCssColor(theme.theme_heading_color, "#18181B");
  const textBody = safeCssColor(theme.theme_text_color, "#3F3F46");
  const tertiaryColor = safeCssColor(theme.theme_tertiary_color, "#F59E0B");
  const primaryHover = theme.theme_button_hover ? safeCssColor(theme.theme_button_hover, primaryColor) : palette.dark;
  const fontSans = theme.theme_font_sans || "inter";
  const fontDisplay = theme.theme_font_display || "poppins";

  // Cores customizadas da Paleta Global → variáveis CSS no canvas (espelha o root layout).
  // Sem isto, valores como `var(--color_xxx)` aplicados a um elemento não resolvem no editor.
  let customTokensCss = "";
  try {
    const tokens = theme.theme_custom_colors ? JSON.parse(theme.theme_custom_colors) : [];
    tokens.forEach((token: { id: string; hex: string }) => {
      if (safeCssTokenId(token.id) && /^#[0-9A-Fa-f]{3,8}$/.test(token.hex)) {
        customTokensCss += `      --${token.id}: ${token.hex};\n`;
      }
    });
  } catch {
    /* JSON inválido — ignora */
  }

  const themeStyles = `
    .canvas-theme-root {
      --theme-primary: ${palette.primary};
      --theme-primary-dark: ${palette.dark};
      --theme-primary-light: ${palette.light};
      --theme-primary-soft: ${palette.soft};
      --theme-primary-bg: ${palette.bg};
      --theme-primary-hover: ${primaryHover};
      --theme-surface-50: ${surfaceBg};
      --theme-surface-100: #F4F4F5;
      --theme-surface-200: #E4E4E7;
      --theme-text-heading: ${textHeading};
      --theme-text-body: ${textBody};
      --theme-tertiary: ${tertiaryColor};
      --font-sans: var(--font-${fontSans});
      --font-display: var(--font-${fontDisplay});
${customTokensCss}    }
  `;

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d10] relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />

      {/* HUD Flutuante (Zoom e Grid) — escondido no modo preview */}
      {!isPreview && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-2 bg-[#14141f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} aria-label="Diminuir zoom" title="Diminuir zoom" className="p-2 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"><ZoomOut className="w-4 h-4" /></button>
            <div className="flex items-center justify-center min-w-[40px]">
              <span className="text-[11px] font-black text-white">{(zoom * 100).toFixed(0)}%</span>
            </div>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} aria-label="Aumentar zoom" title="Aumentar zoom" className="p-2 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={() => setZoom(1)} aria-label="Redefinir zoom" className="p-2 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-all active:rotate-180 duration-500" title="Reset Zoom"><RotateCcw className="w-4 h-4" /></button>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <button
            onClick={() => setShowGrid(!showGrid)}
            aria-label={showGrid ? "Ocultar grade" : "Mostrar grade"}
            aria-pressed={showGrid}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300",
              showGrid ? "bg-indigo-500/20 text-indigo-300" : "text-zinc-400 hover:text-white hover:bg-white/10"
            )}
            title="Toggle Grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Canvas Area — clicar no fundo (fora de uma seção) limpa a seleção */}
      <div
        onClick={() => { if (!isPreview && selectedSectionId) selectSection(null); }}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-12 scroll-smooth custom-scrollbar relative"
      >
        {/* Grid Pattern Background */}
        {showGrid && !isPreview && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]"
            style={{ backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }} />
        )}

        {/* Viewport Container with Zoom */}
        <div className="flex flex-col items-center">
          <div
            className={cn(
              "relative z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top canvas-theme-root my-8",
              "bg-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.2)] ring-1 ring-text-900/10",
              viewport === "desktop" && "w-[1440px] rounded-xl",
              viewport === "tablet" && "w-[768px] rounded-[48px] border-[12px] border-text-900",
              viewport === "mobile" && "w-[375px] rounded-[56px] border-[14px] border-text-900"
            )}
            style={{
              transform: `scale(${zoom})`,
              minHeight: viewport === "mobile" ? "812px" : "calc(100vh - 160px)",
              backgroundColor: surfaceBg,
              marginBottom: `calc(${zoom} * 100px)`
            }}
          >
            {/* Mobile UI elements */}
            {viewport === "mobile" && (
              <>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-text-900 rounded-b-3xl z-[150] flex items-center justify-center gap-2">
                  <div className="w-12 h-1 bg-text-800 rounded-full" />
                  <div className="w-2 h-2 bg-text-800 rounded-full" />
                </div>
                {/* Status Bar */}
                <div className="absolute top-0 left-0 w-full h-8 px-8 flex items-center justify-between z-[140] text-text-900 font-bold text-[10px]">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>
              </>
            )}

            {/* Site Content */}
            <div className={cn(
              "w-full relative",
              viewport === "mobile" && "pt-8"
            )}>
              {/* Canvas Sections Container */}
              <div className="flex-1">
                {sections.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-40 transition-all">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center max-w-sm px-6"
                    >
                      <div className="w-24 h-24 bg-surface-50 rounded-3xl shadow-sm border border-text-50 flex items-center justify-center mx-auto mb-8 relative">
                        <LayoutTemplate className="w-10 h-10 text-text-300" />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="absolute -top-2 -right-2 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg"
                        >
                          <Plus className="w-6 h-6" />
                        </motion.div>
                      </div>

                      <h2 className="text-2xl font-display font-black text-text-900 mb-3 tracking-tight">
                        Seu Canvas está vazio
                      </h2>
                      <p className="text-text-500 text-sm leading-relaxed mb-8">
                        Adicione blocos para começar a construir seu site.
                      </p>
                      {!isPreview && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openInserter(null); }}
                          className="group inline-flex items-center gap-2.5 px-6 py-3 bg-zinc-900 text-white rounded-full shadow-lg hover:bg-primary transition-all duration-300 active:scale-95"
                        >
                          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                          <span className="text-sm font-bold tracking-tight">Adicionar primeira seção</span>
                        </button>
                      )}
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                      {!isPreview && <InsertDivider index={0} />}
                      {sections.map((section, index) => (
                        <div key={section.id}>
                          <SectionInCanvas
                            section={section}
                            index={index}
                            isSelected={selectedSectionId === section.id}
                            onSelect={() => selectSection(section.id)}
                          />
                          {!isPreview && <InsertDivider index={index + 1} />}
                        </div>
                      ))}
                    </SortableContext>

                    {/* Global Action: Add Section — escondido no preview */}
                    {!isPreview && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center py-12 border-t border-zinc-50 bg-zinc-50/50"
                      >
                        <button onClick={(e) => { e.stopPropagation(); openInserter(null); }} className="group flex items-center gap-3 px-6 py-3 bg-white hover:bg-zinc-900 hover:text-white rounded-full border border-zinc-200 shadow-sm transition-all duration-300">
                          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                          <span className="text-sm font-bold tracking-tight">Adicionar Seção</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
