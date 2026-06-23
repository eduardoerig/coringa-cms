"use client";

import type { CanvasElement } from "./canvasModel";
import { CANVAS_ICONS } from "./canvasIcons";

// Render puro do CONTEÚDO de um elemento (preenche 100% da caixa). O posicionamento
// absoluto + rotação ficam no wrapper (CanvasSection no público, CanvasEditor no editor).
// Tamanhos que devem escalar usam `cqw` (1cqw = 1% da largura do container do artboard),
// garantindo WYSIWYG idêntico no editor e no público sem JS.

type Align = "left" | "center" | "right";
function align(v: unknown): Align {
  return v === "center" || v === "right" ? v : "left";
}

const ROUNDED_PX: Record<string, number> = { none: 0, md: 12, xl: 28 };

// Converte links comuns (YouTube/Vimeo) para a URL de embed; demais URLs passam direto.
function embedUrl(raw: string): string {
  if (!raw) return "";
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : raw;
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : raw;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : raw;
    }
    return raw;
  } catch {
    return raw;
  }
}

export function CanvasElementRenderer({ element, designWidth, editor = false }: { element: CanvasElement; designWidth: number; editor?: boolean }) {
  const p = element.props || {};
  const u = (px: number) => `${(px / designWidth) * 100}cqw`;

  switch (element.type) {
    case "text":
      return (
        <div
          data-canvas-text
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            fontSize: u(Number(p.fontSize) || 24),
            fontWeight: Number(p.fontWeight) || 700,
            lineHeight: p.lineHeight ? String(p.lineHeight) : "1.2",
            color: (p.color as string) || "var(--color-text-900)",
            textAlign: align(p.align),
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflow: "hidden",
          }}
        >
          {(p.text as string) ?? ""}
        </div>
      );

    case "image": {
      const src = (p.src as string) || "";
      const rounded = (p.rounded as string) || "md";
      const radius = rounded === "full" ? "9999px" : u(ROUNDED_PX[rounded] ?? 12);
      if (!src) {
        return (
          <div
            className="w-full h-full bg-surface-100 flex items-center justify-center text-text-300 font-medium"
            style={{ borderRadius: radius, fontSize: u(13) }}
          >
            Sem imagem
          </div>
        );
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={(p.alt as string) || ""}
          style={{ width: "100%", height: "100%", objectFit: (p.fit as "cover" | "contain") || "cover", borderRadius: radius, display: "block" }}
        />
      );
    }

    case "shape": {
      const shape = (p.shape as string) || "rect";
      const fill = (p.fill as string) || "var(--color-primary)";
      if (shape === "line") {
        return (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center" }}>
            <div style={{ width: "100%", height: u(Number(p.strokeWidth) || 4), background: fill, borderRadius: "9999px" }} />
          </div>
        );
      }
      const bw = Number(p.borderWidth) || 0;
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: fill,
            borderRadius: shape === "ellipse" ? "9999px" : u(Number(p.radius) || 0),
            border: bw > 0 ? `${u(bw)} solid ${(p.borderColor as string) || "transparent"}` : undefined,
          }}
        />
      );
    }

    case "embed": {
      const url = embedUrl((p.url as string) || "");
      const radius = u(ROUNDED_PX[(p.rounded as string)] ?? 12);
      if (!url) {
        return (
          <div className="w-full h-full bg-surface-100 flex items-center justify-center text-text-300 font-medium" style={{ borderRadius: radius, fontSize: u(13) }}>
            Adicione um link de vídeo
          </div>
        );
      }
      return (
        <iframe
          src={url}
          title="Vídeo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", height: "100%", border: 0, borderRadius: radius, pointerEvents: editor ? "none" : "auto", display: "block" }}
        />
      );
    }

    case "icon": {
      const Cmp = CANVAS_ICONS[(p.name as string)] ?? CANVAS_ICONS.Star;
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: (p.color as string) || "var(--color-primary)" }}>
          <Cmp style={{ width: "100%", height: "100%" }} />
        </div>
      );
    }

    case "draw": {
      const pts = (p.points as { x: number; y: number }[]) || [];
      const vw = Number(p.vw) || 1;
      const vh = Number(p.vh) || 1;
      const d = pts.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x} ${pt.y}`).join(" ");
      return (
        <svg viewBox={`0 0 ${vw} ${vh}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible", display: "block" }}>
          <path
            d={d}
            fill="none"
            stroke={(p.stroke as string) || "var(--color-primary)"}
            strokeWidth={Number(p.strokeWidth) || 6}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    }

    case "button":
      return (
        <div style={{ width: "100%", height: "100%" }}>
          <a
            href={(p.href as string) || "#"}
            style={{
              width: "100%",
              height: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: u(8),
              padding: `0 ${u(24)}`,
              fontWeight: 600,
              fontSize: u(Number(p.fontSize) || 16),
              borderRadius: p.radius === "full" ? "9999px" : u(ROUNDED_PX[(p.radius as string)] ?? 28),
              backgroundColor: (p.bgColor as string) || "var(--color-primary)",
              color: (p.textColor as string) || "#FFFFFF",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {(p.label as string) || "Clique aqui"}
          </a>
        </div>
      );

    default:
      return null;
  }
}
