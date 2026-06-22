import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  /** Cor de destaque (hex ou var(--...)); cai para a terciária do tema. */
  color?: string;
  isDark?: boolean;
  /** Liga o clique→campo / edição inline no editor. */
  dataField?: string;
  className?: string;
}

/** Chip-assinatura "boutique": pílula arredondada com bolinha, na cor do tema. */
export function Eyebrow({ children, color, isDark, dataField, className }: EyebrowProps) {
  const accent = color || (isDark ? "rgba(255,255,255,0.75)" : "var(--color-tertiary)");
  return (
    <span
      data-field={dataField}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide",
        className
      )}
      style={{
        color: accent,
        backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
      {children}
    </span>
  );
}
