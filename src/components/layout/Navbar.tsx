"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  settings?: Record<string, string>;
  isEditor?: boolean;
  props?: {
    site_name?: string;
    logo_url?: string;
    cta_label?: string;
    cta_link?: string;
    links?: Array<{ label: string; url: string }>;
    bgColor?: string;
    textColor?: string;
    ctaBgColor?: string;
    ctaTextColor?: string;
  };
}

export function Navbar({ settings, props, isEditor }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ctaLink = props?.cta_link || settings?.marketing_cta_link || "#";
  const ctaLabel = props?.cta_label || settings?.marketing_cta_label || "Agende Agora";
  const logoUrl = props?.logo_url || settings?.theme_icon_url || settings?.theme_logo_url || "https://img.freepik.com/vetores-gratis/modelo-de-logotipo-de-spa-de-luxo_23-2148903251.jpg?w=740";
  const siteName = props?.site_name || settings?.general_site_name || "Meu Site";
  const links = props?.links || [
    { label: "Início", url: "#hero-section" },
    { label: "Serviços", url: "#cardapio" },
    { label: "Sobre", url: "#sobre" },
    { label: "Spa", url: "#franquia" },
  ];

  const compact = scrolled || isEditor;
  const customBgColor = props?.bgColor || "rgba(255,255,255,0.9)";
  const customTextColor = props?.textColor || "";
  const customCtaBgColor = props?.ctaBgColor || "";
  const customCtaTextColor = props?.ctaTextColor || "";
  const ctaBg = customCtaBgColor || "var(--color-primary)";

  return (
    <div className={cn(isEditor && "relative")}>
      <nav className={cn(isEditor ? "relative" : "fixed top-0 left-0", "w-full z-[100] transition-all duration-300", compact ? "py-3" : "py-5")}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Cápsula flutuante quando rolado/editor */}
          <div
            className={cn("flex items-center justify-between transition-all duration-300", compact ? "rounded-full px-5 py-2.5" : "px-2")}
            style={compact ? {
              backgroundColor: customBgColor,
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.04)",
            } : {}}
          >
            <a href="#hero-section" className="flex items-center gap-2" aria-label="Home">
              {logoUrl ? (
                <Image src={logoUrl} alt={siteName} width={60} height={60} data-field="logo_url" className={cn("transition-all duration-300 object-contain", compact ? "h-[42px] w-auto" : "h-[58px] w-auto")} />
              ) : (
                <span data-field="site_name" className={cn("font-display font-semibold tracking-tight transition-all", compact ? "text-lg" : "text-2xl")} style={{ color: compact ? (customTextColor || "inherit") : "#FFFFFF" }}>{siteName}</span>
              )}
            </a>

            <div className="hidden md:flex items-center gap-7">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  data-field="links"
                  data-item-index={idx}
                  className="font-medium text-sm transition-colors"
                  style={{ color: compact ? (customTextColor || "var(--color-text-500)") : "#FFFFFF" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = ctaBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = compact ? (customTextColor || "var(--color-text-500)") : "#FFFFFF"; }}
                >
                  {link.label}
                </a>
              ))}
              {ctaLink && (
                <a
                  href={ctaLink}
                  target="_blank"
                  rel="noreferrer"
                  data-field="cta_label"
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:-translate-y-0.5"
                  style={{ backgroundColor: ctaBg, color: customCtaTextColor || "#FFFFFF", boxShadow: `0 10px 24px -10px ${ctaBg}` }}
                >
                  <span>{ctaLabel}</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </a>
              )}
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-[5px] p-2 z-[1001]" aria-label="Abrir menu">
              {[0, 1, 2].map((i) => (
                <span key={i} className={cn("w-5 h-[2px] rounded-full transition-all duration-300", menuOpen && i === 0 && "rotate-45 translate-y-[7px]", menuOpen && i === 1 && "opacity-0", menuOpen && i === 2 && "-rotate-45 -translate-y-[7px]")} style={{ backgroundColor: (compact || menuOpen) ? (customTextColor || "#000") : "#FFF" }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={cn(isEditor ? "absolute top-0 left-0 w-full min-h-[400px]" : "fixed inset-0", "z-[90] bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-6")}
          >
            {links.map((link, idx) => (
              <a key={idx} href={link.url} onClick={() => setMenuOpen(false)} className="text-3xl font-display font-medium tracking-tight" style={{ color: customTextColor || "var(--color-text-900)" }}>{link.label}</a>
            ))}
            {ctaLink && (
              <a href={ctaLink} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)} className="mt-4 flex items-center gap-3 px-8 py-4 rounded-full text-xl font-semibold shadow-xl" style={{ backgroundColor: ctaBg, color: customCtaTextColor || "#FFFFFF" }}>
                <span>{ctaLabel}</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
