"use client";

import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";
import type { ContainerBlock } from "./containerModel";

const ROUNDED: Record<string, string> = { none: "", md: "rounded-lg", xl: "rounded-2xl", full: "rounded-full" };
const SPACER: Record<string, string> = { sm: "24px", md: "48px", lg: "80px", xl: "120px" };

type Align = "left" | "center" | "right";
function align(v: unknown): Align {
  return v === "center" || v === "right" ? v : "left";
}

export function BlockRenderer({ block }: { block: ContainerBlock }) {
  const p = block.props || {};

  switch (block.type) {
    case "heading": {
      const level = ["h2", "h3", "h4"].includes(p.level as string) ? (p.level as "h2" | "h3" | "h4") : "h2";
      const sizes: Record<string, string> = { h2: "text-3xl md:text-4xl", h3: "text-2xl md:text-3xl", h4: "text-xl md:text-2xl" };
      const Tag = level;
      return (
        <Tag
          className={cn("font-display font-bold leading-tight", sizes[level])}
          style={{ color: (p.color as string) || "var(--color-text-900)", textAlign: align(p.align) }}
        >
          {(p.text as string) || "Título"}
        </Tag>
      );
    }
    case "text":
      return (
        <div
          className="leading-relaxed text-base [&_a]:underline"
          style={{ color: (p.color as string) || "var(--color-text-500)", textAlign: align(p.align) }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize((p.content as string) || "") }}
        />
      );
    case "image": {
      const src = (p.src as string) || "";
      if (!src) {
        return (
          <div className="w-full aspect-video bg-surface-100 rounded-2xl flex items-center justify-center text-text-300 text-xs font-medium">
            Sem imagem
          </div>
        );
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={(p.alt as string) || ""}
          className={cn("w-full h-auto object-cover", ROUNDED[(p.rounded as string)] ?? "rounded-2xl")}
        />
      );
    }
    case "button":
      return (
        <div style={{ textAlign: align(p.align) }}>
          <a
            href={(p.href as string) || "#"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-transform hover:scale-105"
            style={{ backgroundColor: (p.bgColor as string) || "var(--color-primary)", color: (p.textColor as string) || "#FFFFFF" }}
          >
            {(p.label as string) || "Clique aqui"}
          </a>
        </div>
      );
    case "spacer":
      return <div aria-hidden style={{ height: SPACER[(p.height as string)] ?? "48px" }} />;
    case "divider":
      return <hr className="border-0 h-px w-full" style={{ backgroundColor: (p.color as string) || "var(--color-surface-200)" }} />;
    default:
      return null;
  }
}
