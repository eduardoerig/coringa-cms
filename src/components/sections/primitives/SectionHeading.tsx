import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  children: React.ReactNode;
  /** Cor do título (hex ou var(--...)); cai para o heading do tema. */
  color?: string;
  isDark?: boolean;
  dataField?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/** Título de seção "boutique": display Poppins, grande e arredondado no ritmo. */
export function SectionHeading({ children, color, isDark, dataField, as: Tag = "h2", className }: SectionHeadingProps) {
  return (
    <Tag
      data-field={dataField}
      className={cn(
        "font-display font-bold tracking-tight leading-[1.08] text-[clamp(2rem,4vw,3.25rem)]",
        className
      )}
      style={{ color: color || (isDark ? "#FFFFFF" : "var(--color-text-900)") }}
    >
      {children}
    </Tag>
  );
}
