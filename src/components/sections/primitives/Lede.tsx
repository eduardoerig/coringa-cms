import { cn } from "@/lib/utils";

interface LedeProps {
  children: React.ReactNode;
  /** Cor do texto (hex ou var(--...)); cai para o corpo do tema. */
  color?: string;
  isDark?: boolean;
  dataField?: string;
  className?: string;
}

/** Subtítulo/lede de seção: corpo Inter, leitura confortável. */
export function Lede({ children, color, isDark, dataField, className }: LedeProps) {
  return (
    <p
      data-field={dataField}
      className={cn("text-base md:text-lg leading-relaxed", className)}
      style={{ color: color || (isDark ? "rgba(255,255,255,0.8)" : "var(--color-text-500)") }}
    >
      {children}
    </p>
  );
}
