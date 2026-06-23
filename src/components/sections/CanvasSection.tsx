"use client";

import { getSectionStyles } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editorStore";
import { CanvasElementRenderer } from "@/components/editor/canvas/CanvasElementRenderer";
import { CanvasEditor } from "@/components/editor/canvas/CanvasEditor";
import { resolveElement, resolveHeight, hasResponsive, type CanvasElement, type Viewport } from "@/components/editor/canvas/canvasModel";

interface CanvasSectionProps {
  settings?: Record<string, string>;
  props?: Record<string, unknown>;
  isEditor?: boolean;
  sectionId?: string;
}

// Artboard escalado por CSS (container units), resolvendo cada elemento p/ o dispositivo.
function Artboard({ elements, DW, height, background, viewport, editor }: {
  elements: CanvasElement[];
  DW: number;
  height: number;
  background: React.CSSProperties;
  viewport: Viewport;
  editor: boolean;
}) {
  return (
    <div style={{ containerType: "inline-size", width: "100%" }}>
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${DW} / ${height}`, ...background }}>
        {elements.map((el) => {
          const r = resolveElement(el, viewport);
          if (r.hidden) return null;
          return (
            <div
              key={el.id}
              className="absolute"
              style={{
                left: `${(r.x / DW) * 100}%`,
                top: `${(r.y / height) * 100}%`,
                width: `${(r.w / DW) * 100}%`,
                height: `${(r.h / height) * 100}%`,
                transform: `rotate(${r.rotation}deg)`,
                opacity: el.opacity ?? 1,
              }}
            >
              <CanvasElementRenderer element={el} designWidth={DW} editor={editor} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tela Livre (estilo Canva). No público a tela escala proporcionalmente via CSS; com
// ajustes por dispositivo, renderiza um artboard por breakpoint (Tailwind md/lg).
export function CanvasSection({ props: editorProps, isEditor, sectionId }: CanvasSectionProps) {
  const styles = getSectionStyles(editorProps || {});
  const DW = Number(editorProps?.designWidth) || 1200;
  const H = Number(editorProps?.height) || 600;
  const fullWidth = !!editorProps?.fullWidth;
  const elements = (editorProps?.elements as CanvasElement[]) || [];
  const grid = Number(editorProps?.grid) || 0;

  const num = (v: unknown) => (v != null && v !== "" ? Number(v) : undefined);
  const hT = num(editorProps?.heightTablet);
  const hM = num(editorProps?.heightMobile);
  const heights = { desktop: H, tablet: hT, mobile: hM };

  const background: React.CSSProperties = {};
  if (editorProps?.bgColor) background.backgroundColor = editorProps.bgColor as string;
  if (editorProps?.bgImage) {
    background.backgroundImage = `url(${editorProps.bgImage as string})`;
    background.backgroundSize = "cover";
    background.backgroundPosition = "center";
  }

  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const editorViewport = useEditorStore((s) => s.viewport) as Viewport;
  const editing = !!isEditor && !!sectionId && selectedSectionId === sectionId;

  // No público, uma tela vazia não renderiza nada.
  if (!isEditor && elements.length === 0) return null;

  const responsive = hasResponsive(elements) || hT != null || hM != null;

  return (
    <section className={cn("relative", styles.container)} style={styles.style}>
      <div className={cn(fullWidth ? "w-full" : "max-w-7xl mx-auto px-6")}>
        {editing && sectionId ? (
          <CanvasEditor sectionId={sectionId} designWidth={DW} heights={heights} elements={elements} grid={grid} background={background} />
        ) : isEditor ? (
          <>
            <Artboard elements={elements} DW={DW} height={resolveHeight(heights, editorViewport)} background={background} viewport={editorViewport} editor />
            {elements.length === 0 && <p className="text-center text-sm text-zinc-300 py-8">Tela livre vazia — clique para editar</p>}
          </>
        ) : responsive ? (
          <>
            <div className="hidden lg:block"><Artboard elements={elements} DW={DW} height={resolveHeight(heights, "desktop")} background={background} viewport="desktop" editor={false} /></div>
            <div className="hidden md:block lg:hidden"><Artboard elements={elements} DW={DW} height={resolveHeight(heights, "tablet")} background={background} viewport="tablet" editor={false} /></div>
            <div className="md:hidden"><Artboard elements={elements} DW={DW} height={resolveHeight(heights, "mobile")} background={background} viewport="mobile" editor={false} /></div>
          </>
        ) : (
          <Artboard elements={elements} DW={DW} height={H} background={background} viewport="desktop" editor={false} />
        )}
      </div>
    </section>
  );
}

export default CanvasSection;
