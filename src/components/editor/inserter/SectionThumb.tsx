"use client";

import { cn } from "@/lib/utils";

// Miniatura esquemática (wireframe) por tipo de seção — fiel ao layout, sem fotos.
const BOX = "rounded bg-zinc-300";
const SOFT = "rounded bg-zinc-200";

function Lines({ center = false }: { center?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1 w-full", center && "items-center")}>
      <div className={cn("h-1.5", BOX, center ? "w-1/2" : "w-3/4")} />
      <div className={cn("h-1.5", SOFT, "w-2/3")} />
      <div className={cn("h-1.5", SOFT, "w-1/2")} />
    </div>
  );
}

function Pill() {
  return <div className="h-2.5 w-6 rounded-full bg-zinc-300" />;
}

export function SectionThumb({ type }: { type: string }) {
  switch (type) {
    case "header":
      return (
        <div className="w-full h-full flex items-center justify-between gap-2">
          <div className="h-3 w-8 rounded bg-zinc-400" />
          <div className="flex gap-1.5">
            <div className="h-1.5 w-5 rounded bg-zinc-300" />
            <div className="h-1.5 w-5 rounded bg-zinc-300" />
            <div className="h-1.5 w-5 rounded bg-zinc-300" />
          </div>
          <div className="h-3 w-7 rounded-full bg-zinc-400" />
        </div>
      );
    case "hero":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <div className="flex items-end gap-1.5">
            <div className={cn("w-4 h-7", BOX)} />
            <div className={cn("w-5 h-9", BOX)} />
            <div className={cn("w-4 h-7", BOX)} />
          </div>
          <div className="h-1.5 w-1/2 rounded bg-zinc-300" />
          <div className="h-2.5 w-8 rounded-full bg-zinc-400" />
        </div>
      );
    case "highlights":
      return (
        <div className="w-full h-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0" />
          <div className="flex gap-1.5 flex-1 h-3/4">
            <div className={cn("flex-1", BOX)} />
            <div className={cn("flex-1", BOX)} />
            <div className={cn("flex-1", BOX)} />
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0" />
        </div>
      );
    case "menu":
      return (
        <div className="w-full h-full flex flex-col gap-1.5">
          <div className="flex justify-center gap-1.5"><Pill /><Pill /><Pill /></div>
          <div className="flex gap-1.5 flex-1">
            <div className={cn("flex-1", BOX)} />
            <div className={cn("flex-1", BOX)} />
            <div className={cn("flex-1", BOX)} />
            <div className={cn("flex-1", BOX)} />
          </div>
        </div>
      );
    case "about":
      return (
        <div className="w-full h-full flex items-center gap-3">
          <Lines />
          <div className={cn("w-1/3 h-3/4", BOX)} />
        </div>
      );
    case "franchise":
      return (
        <div className="w-full h-full flex items-center gap-3 p-2 rounded-lg bg-zinc-100">
          <div className="flex-1 flex flex-col gap-1.5">
            <Lines />
            <div className="flex gap-1.5">
              <div className="h-4 flex-1 rounded bg-zinc-200" />
              <div className="h-4 flex-1 rounded bg-zinc-200" />
            </div>
          </div>
          <div className={cn("w-1/3 h-full", BOX)} />
        </div>
      );
    case "gallery":
      return (
        <div className="w-full h-full grid grid-cols-3 grid-rows-2 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className={BOX} />)}
        </div>
      );
    case "cta_banner":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-4/5 h-4/5 rounded-xl bg-zinc-200 flex flex-col items-center justify-center gap-2">
            <div className="h-1.5 w-1/2 rounded bg-zinc-300" />
            <div className="h-2.5 w-8 rounded-full bg-zinc-400" />
          </div>
        </div>
      );
    case "text_block":
      return (
        <div className="w-full h-full flex flex-col justify-center gap-1.5">
          <div className="h-2 w-1/2 rounded bg-zinc-300" />
          <div className="h-1.5 w-full rounded bg-zinc-200" />
          <div className="h-1.5 w-full rounded bg-zinc-200" />
          <div className="h-1.5 w-2/3 rounded bg-zinc-200" />
        </div>
      );
    case "divider":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="h-0.5 w-2/3 rounded-full bg-zinc-300" />
        </div>
      );
    case "container":
      return (
        <div className="w-full h-full flex flex-col gap-1.5">
          <div className="flex gap-1.5 flex-1">
            <div className={cn("flex-1", BOX)} />
            <div className={cn("flex-1", BOX)} />
            <div className={cn("flex-1", BOX)} />
          </div>
          <div className="flex gap-1.5 flex-1">
            <div className={cn("flex-1", BOX)} />
            <div className={cn("flex-[2]", BOX)} />
          </div>
        </div>
      );
    case "canvas":
      return (
        <div className="relative w-full h-full">
          <div className="absolute top-1 left-2 h-2 w-10 rounded bg-zinc-300" />
          <div className="absolute top-5 left-1 w-7 h-6 rounded bg-zinc-300" />
          <div className="absolute top-2 right-1 w-4 h-4 rounded-full bg-zinc-200" />
          <div className="absolute bottom-3 left-1/2 w-5 h-5 rotate-12 rounded bg-zinc-200" />
          <div className="absolute bottom-1 right-2 h-2.5 w-8 rounded-full bg-zinc-400" />
        </div>
      );
    case "footer":
      return (
        <div className="w-full h-full flex flex-col justify-end gap-2">
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1">
                <div className="h-1.5 w-2/3 rounded bg-zinc-300" />
                <div className="h-1 w-full rounded bg-zinc-200" />
                <div className="h-1 w-3/4 rounded bg-zinc-200" />
              </div>
            ))}
          </div>
          <div className="h-px w-full bg-zinc-200" />
          <div className="h-1 w-1/3 rounded bg-zinc-200" />
        </div>
      );
    default:
      return <Lines center />;
  }
}
