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

  // Cores dinâmicas
  const customBgColor = props?.bgColor || "rgba(255, 255, 255, 0.9)";
  const customTextColor = props?.textColor || "";
  const customCtaBgColor = props?.ctaBgColor || "";
  const customCtaTextColor = props?.ctaTextColor || "";

  return (
    <div className={cn(isEditor && "relative")}>
      <nav
        className={cn(
          isEditor ? "relative" : "fixed top-0 left-0",
          "w-full z-[100] transition-all duration-300",
          (scrolled || isEditor) ? "py-3 shadow-sm" : "py-5 bg-transparent"
        )}
        style={{
          backgroundColor: (scrolled || isEditor) ? customBgColor : "transparent",
          backdropFilter: (scrolled || isEditor) ? "blur(12px)" : "none",
          borderBottom: (scrolled || isEditor) ? "1px solid rgba(0,0,0,0.05)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
          <a href="#hero-section" className="flex items-center gap-2" aria-label="Home">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteName}
                width={60}
                height={60}
                className={cn("transition-transform duration-300 object-contain drop-shadow-sm", scrolled ? "h-[50px] w-auto" : "h-[70px] w-auto scale-110")}
              />
            ) : (
              <span 
                className={cn("font-display font-bold tracking-tight transition-all", scrolled ? "text-xl" : "text-2xl")}
                style={{ color: (scrolled || isEditor) ? (customTextColor || "inherit") : "#FFFFFF" }}
              >
                {siteName}
              </span>
            )}
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link, idx) => (
              <a 
                key={idx} 
                href={link.url} 
                className="nav-link font-semibold text-sm transition-colors relative"
                style={{ color: (scrolled || isEditor) ? (customTextColor || "var(--text-500)") : "#FFFFFF" }}
              >
                {link.label}
              </a>
            ))}
            {ctaLink && (
              <a
                href={ctaLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-bold tracking-wide px-6 py-2.5 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: customCtaBgColor || "var(--primary)",
                  color: customCtaTextColor || "#FFFFFF",
                  boxShadow: customCtaBgColor ? `0 10px 20px ${customCtaBgColor}40` : "0 10px 20px var(--primary-shadow)"
                }}
              >
                <span>{ctaLabel}</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>

          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="md:hidden flex flex-col gap-[5px] p-2 z-[1001]" 
            aria-label="Abrir menu"
          >
            <span 
              className={cn("w-5 h-[2px] rounded-full transition-all duration-300 origin-center", menuOpen && "rotate-45 translate-y-[7px]")} 
              style={{ backgroundColor: (scrolled || isEditor || menuOpen) ? (customTextColor || "#000") : "#FFF" }}
            />
            <span 
              className={cn("w-5 h-[2px] rounded-full transition-all duration-200", menuOpen && "opacity-0")} 
              style={{ backgroundColor: (scrolled || isEditor || menuOpen) ? (customTextColor || "#000") : "#FFF" }}
            />
            <span 
              className={cn("w-5 h-[2px] rounded-full transition-all duration-300 origin-center", menuOpen && "-rotate-45 -translate-y-[7px]")} 
              style={{ backgroundColor: (scrolled || isEditor || menuOpen) ? (customTextColor || "#000") : "#FFF" }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
              isEditor ? "absolute top-0 left-0 w-full min-h-[400px]" : "fixed inset-0",
              "z-[90] bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-6"
            )}
          >
            {links.map((link, idx) => (
              <motion.a 
                key={idx}
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 + idx * 0.05 }} 
                href={link.url} 
                onClick={() => setMenuOpen(false)} 
                className="text-3xl font-display font-medium text-text-900 tracking-tight hover:text-primary transition-colors"
                style={{ color: customTextColor || "" }}
              >
                {link.label}
              </motion.a>
            ))}
            {ctaLink && (
              <motion.a 
                initial={{ opacity: 0, y: 20, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ delay: 0.35, ease: "backOut" }}
                href={ctaLink} 
                target="_blank" 
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className="mt-4 flex items-center gap-3 px-8 py-4 rounded-full text-xl font-bold shadow-xl shadow-primary/20"
                style={{ 
                  backgroundColor: customCtaBgColor || "var(--primary)",
                  color: customCtaTextColor || "#FFFFFF" 
                }}
              >
                <span>{ctaLabel}</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
