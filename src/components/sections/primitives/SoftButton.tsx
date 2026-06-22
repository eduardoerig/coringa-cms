"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SoftButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  target?: string;
  /** primary = preenchido na cor do tema; secondary = contorno suave. */
  variant?: "primary" | "secondary";
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  isDark?: boolean;
  className?: string;
}

/** Botão "boutique": pílula arredondada, sombra suave e leve elevação no hover.
 *  Substitui os botões duplicados de Hero/About/CTA/Franchise. */
export function SoftButton({
  children, href, onClick, target, variant = "primary",
  bgColor, textColor, borderColor, isDark, className,
}: SoftButtonProps) {
  const [hovered, setHovered] = useState(false);

  const primaryBg = bgColor || (isDark ? "#FFFFFF" : "var(--color-primary)");
  const primaryText = textColor || (isDark ? "var(--color-text-900)" : "#FFFFFF");
  const secondaryText = textColor || (isDark ? "#FFFFFF" : "var(--color-text-900)");
  const secondaryBorder = borderColor || (isDark ? "rgba(255,255,255,0.25)" : "var(--color-text-200)");

  const style: React.CSSProperties =
    variant === "primary"
      ? {
          backgroundColor: primaryBg,
          color: primaryText,
          filter: hovered ? "brightness(0.94)" : "none",
          transform: hovered ? "translateY(-2px)" : "none",
          boxShadow: hovered ? "0 18px 40px -12px rgba(0,0,0,0.28)" : "0 8px 30px rgba(0,0,0,0.08)",
        }
      : {
          backgroundColor: "transparent",
          color: secondaryText,
          border: `1px solid ${secondaryBorder}`,
          transform: hovered ? "translateY(-2px)" : "none",
          backdropFilter: "blur(8px)",
        };

  const cls = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-semibold transition-all duration-300",
    className
  );
  const hover = { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) };

  if (href) {
    return (
      <a href={href} target={target} rel={target === "_blank" ? "noreferrer" : undefined} className={cls} style={style} {...hover}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} style={style} {...hover}>
      {children}
    </button>
  );
}
