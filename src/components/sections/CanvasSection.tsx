"use client";

import { getSectionStyles } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editorStore";
import { CanvasElementRenderer } from "@/components/editor/canvas/CanvasElementRenderer";
import { CanvasEditor } from "@/components/editor/canvas/CanvasEditor";
import type { CanvasElement } from "@/components/editor/canvas/canvasModel";

interface CanvasSectionProps {
  settings?: Record<string, string>;
  props?: Record<string, unknown>;
  isEditor?: boolean;
  sectionId?: string;
}

// Tela Livre (estilo Canva): elementos posicionados livremente. No público, o artboard
// escala proporcionalmente com a largura via CSS puro (container units + cqw) — WYSIWYG.
export function CanvasSection({ props: editorProps, isEditor, sectionId }: CanvasSectionProps) {
  const styles = getSectionStyles(editorProps || {});
  const DW = Number(editorProps?.designWidth) || 1200;
  const H = Number(editorProps?.height) || 600;
  const fullWidth = !!editorProps?.fullWidth;
  const elements = (editorProps?.elements as CanvasElement[]) || [];

  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const editing = !!isEditor && !!sectionId && selectedSectionId === sectionId;

  // No público, uma tela vazia não renderiza nada.
  if (!isEditor && elements.length === 0) return null;

  const inner = (
    <div style={{ containerType: "inline-size", width: "100%" }}>
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${DW} / ${H}` }}>
        {elements.map((el) => (
          <div
            key={el.id}
            className="absolute"
            style={{
              left: `${(el.x / DW) * 100}%`,
              top: `${(el.y / H) * 100}%`,
              width: `${(el.w / DW) * 100}%`,
              height: `${(el.h / H) * 100}%`,
              transform: `rotate(${el.rotation}deg)`,
              opacity: el.opacity ?? 1,
            }}
          >
            <CanvasElementRenderer element={el} designWidth={DW} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className={cn("relative", styles.container)} style={styles.style}>
      <div className={cn(fullWidth ? "w-full" : "max-w-7xl mx-auto px-6")}>
        {editing && sectionId ? (
          <CanvasEditor sectionId={sectionId} designWidth={DW} height={H} elements={elements} />
        ) : (
          <>
            {inner}
            {isEditor && elements.length === 0 && (
              <p className="text-center text-sm text-zinc-300 py-8">Tela livre vazia — clique para editar</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default CanvasSection;
