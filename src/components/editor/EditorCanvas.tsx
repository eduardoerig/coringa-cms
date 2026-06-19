import { useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { SectionInCanvas } from "./SectionInCanvas";
import { 
  Plus, 
  LayoutTemplate, 
  MousePointer2, 
  Sparkles, 
  Monitor, 
  Tablet, 
  Smartphone,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Signal,
  Wifi,
  Battery,
  Grid3X3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generatePalette, safeCssColor } from "@/utils/colors";
import { cn } from "@/lib/utils";

type Viewport = "desktop" | "tablet" | "mobile";

export function EditorCanvas({ onOpenLibrary }: { onOpenLibrary?: () => void }) {
  const { sections, selectedSectionId, selectSection, theme } = useEditorStore();
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [zoom, setZoom] = useState(0.85);
  const [showGrid, setShowGrid] = useState(true);

  const primaryColor = safeCssColor(theme.theme_primary_color, "#2563EB");
  const surfaceBg = safeCssColor(theme.theme_bg_color, "#FAFAFA");
  const palette = generatePalette(primaryColor);
  const textHeading = safeCssColor(theme.theme_heading_color, "#18181B");
  const textBody = safeCssColor(theme.theme_text_color, "#3F3F46");
  const tertiaryColor = safeCssColor(theme.theme_tertiary_color, "#F59E0B");
  const primaryHover = theme.theme_button_hover ? safeCssColor(theme.theme_button_hover, primaryColor) : palette.dark;
  const fontSans = theme.theme_font_sans || "inter";
  const fontDisplay = theme.theme_font_display || "space-grotesk";

  const themeStyles = `
    .canvas-theme-root {
      --theme-primary: ${palette.primary};
      --theme-primary-dark: ${palette.dark};
      --theme-primary-light: ${palette.light};
      --theme-primary-soft: ${palette.soft};
      --theme-primary-bg: ${palette.bg};
      --theme-primary-hover: ${primaryHover};
      --theme-surface-50: ${surfaceBg};
      --theme-text-heading: ${textHeading};
      --theme-text-body: ${textBody};
      --theme-tertiary: ${tertiaryColor};
      --font-sans: var(--font-${fontSans});
      --font-display: var(--font-${fontDisplay});
    }
  `;

  return (
    <div className="flex-1 flex flex-col bg-[#F1F1F4] relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      
      {/* Viewport Header */}
      <div className="h-16 border-b border-text-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <div className="flex bg-surface-50 p-1 rounded-2xl border border-text-100 shadow-sm">
            <button
              onClick={() => { setViewport("desktop"); setZoom(0.85); }}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                viewport === "desktop" ? "bg-text-900 text-white shadow-lg" : "text-text-400 hover:text-text-900 hover:bg-surface-100"
              )}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setViewport("tablet"); setZoom(0.7); }}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                viewport === "tablet" ? "bg-text-900 text-white shadow-lg" : "text-text-400 hover:text-text-900 hover:bg-surface-100"
              )}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setViewport("mobile"); setZoom(0.9); }}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                viewport === "mobile" ? "bg-text-900 text-white shadow-lg" : "text-text-400 hover:text-text-900 hover:bg-surface-100"
              )}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-text-100" />

          <button 
            onClick={() => setShowGrid(!showGrid)}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 border shadow-sm",
              showGrid ? "bg-primary/10 text-primary border-primary/20" : "bg-surface-50 text-text-400 border-text-100 hover:text-text-900"
            )}
            title="Toggle Grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-text-400 uppercase tracking-widest bg-surface-50 px-4 py-2 rounded-2xl border border-text-100 shadow-sm">
            {viewport === "desktop" && (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>MacBook Pro 14" • 1440 × 900</span>
              </>
            )}
            {viewport === "tablet" && (
              <>
                <Tablet className="w-3.5 h-3.5" />
                <span>iPad Air • 768 × 1024</span>
              </>
            )}
            {viewport === "mobile" && (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone 14 Pro • 375 × 812</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-surface-50 p-1 rounded-2xl border border-text-100 shadow-sm">
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-2 rounded-xl text-text-400 hover:bg-white hover:text-text-900 transition-all active:scale-90"><ZoomOut className="w-4 h-4" /></button>
            <div className="flex flex-col items-center min-w-[48px]">
              <span className="text-[11px] font-black text-text-900 leading-none">{(zoom * 100).toFixed(0)}%</span>
              <span className="text-[8px] font-bold text-text-300 uppercase tracking-tighter mt-0.5">Zoom</span>
            </div>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 rounded-xl text-text-400 hover:bg-white hover:text-text-900 transition-all active:scale-90"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={() => setZoom(1)} className="p-2 rounded-xl text-text-400 hover:bg-white hover:text-text-900 transition-all active:rotate-180 duration-500" title="Reset Zoom"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-12 scroll-smooth custom-scrollbar relative">
        {/* Grid Pattern Background */}
        {showGrid && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]" 
               style={{ backgroundImage: "radial-gradient(#000 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }} />
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
                <div className="flex-1 flex flex-col items-center justify-center py-40">
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
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <AnimatePresence mode="popLayout">
                    {sections.map((section, index) => (
                      <motion.div
                        key={section.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <SectionInCanvas
                          section={section}
                          index={index}
                          isSelected={selectedSectionId === section.id}
                          onSelect={() => selectSection(section.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Global Action: Add Section */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center py-12 border-t border-zinc-50 bg-zinc-50/50"
                  >
                    <button onClick={onOpenLibrary} className="group flex items-center gap-3 px-6 py-3 bg-white hover:bg-zinc-900 hover:text-white rounded-full border border-zinc-200 shadow-sm transition-all duration-300">
                      <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                      <span className="text-sm font-bold tracking-tight">Adicionar Seção</span>
                    </button>
                  </motion.div>
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
