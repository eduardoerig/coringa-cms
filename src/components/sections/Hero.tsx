"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { getSectionStyles, SOFT } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./primitives/SectionHeading";
import { Lede } from "./primitives/Lede";
import { SoftButton } from "./primitives/SoftButton";

interface HeroProduct { src: string; alt: string; description: string; }
interface HeroProps { settings?: Record<string, string>; props?: Record<string, any>; isEditor?: boolean; }

export function Hero({ props: editorProps, isEditor }: HeroProps) {
  const styles = getSectionStyles(editorProps || {});
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  // Parallax sutil (boutique = movimento contido)
  const yGentle = useTransform(scrollYProgress, [0, 1], [0, isEditor ? 0 : 28]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const opacity = isEditor ? undefined : scrollOpacity;

  const layoutVariant = (editorProps?.layout_variant as string) || "floating";
  const backgroundImage = editorProps?.backgroundImage as string;
  let parsedOpacity = parseInt(String(editorProps?.overlayOpacity || "40").trim());
  if (isNaN(parsedOpacity)) parsedOpacity = 40;
  const overlayOpacity = parsedOpacity / 100;

  const title = (editorProps?.title as string) || "Transformamos ideias em experiências";
  const subtitle = (editorProps?.subtitle as string) || "Descubra nossos produtos e serviços feitos com dedicação e paixão.";
  const badge = (editorProps?.badge as string) || "Qualidade & Excelência";
  const ctaText = (editorProps?.ctaText as string) || "Ver Produtos";
  const ctaLink = (editorProps?.ctaLink as string) || "#cardapio";
  const ctaSecondaryText = (editorProps?.ctaSecondaryText as string) || "Saiba Mais";
  const ctaSecondaryLink = (editorProps?.ctaSecondaryLink as string) || "#sobre";

  // Cores dinâmicas — tokens semânticos unificados
  const titleColor = (editorProps?.titleColor as string) || "";
  const subtitleColor = (editorProps?.subtitleColor as string) || "";
  const accentColor = (editorProps?.accentColor as string) || "";
  const badgeColor = (editorProps?.badgeColor as string) || "";
  const badgeTextColor = (editorProps?.badgeTextColor as string) || "";
  const btnBgColor = (editorProps?.btnBgColor as string) || "";
  const btnTextColor = (editorProps?.btnTextColor as string) || "";
  const secondaryBtnBorderColor = (editorProps?.secondaryBtnBorderColor as string) || "";
  const secondaryBtnTextColor = (editorProps?.secondaryBtnTextColor as string) || "";

  const isOnImage = layoutVariant === "full_bg";
  const accent = accentColor || "var(--color-primary)";

  const providedProducts = editorProps?.products as HeroProduct[];
  const heroProducts = (providedProducts && providedProducts.length > 0) ? providedProducts : [
    { src: "https://images.pexels.com/photos/3985330/pexels-photo-3985330.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Produto 1", description: "Qualidade e cuidado em cada detalhe." },
    { src: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Produto 2", description: "Uma experiência que encanta." },
    { src: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Produto 3", description: "Feito para o seu melhor momento." },
  ];

  return (
    <section
      ref={containerRef}
      id="hero-section"
      className={cn(
        "relative min-h-[88vh] flex items-center justify-center overflow-hidden",
        isOnImage ? "text-white" : styles.container
      )}
      style={isOnImage ? {} : styles.style}
    >
      {/* Fundo (variante Fundo Total) */}
      {isOnImage && backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
        </div>
      )}

      {/* Blobs decorativos suaves (demais variantes) */}
      {!isOnImage && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full blur-[120px]" style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)` }} />
          <div className="absolute bottom-1/4 -right-24 w-80 h-80 rounded-full blur-[110px]" style={{ backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }} />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 w-full relative z-10">
        {/* Produtos flutuantes */}
        {layoutVariant === "floating" && heroProducts.length > 0 && (
          <div className="relative flex items-end justify-center gap-6 md:gap-10 max-w-2xl mx-auto mb-12 md:mb-16">
            {heroProducts.slice(0, 3).map((product: HeroProduct, index: number) => (
              <div key={product.alt + index} data-field="products" data-item-index={index}>
                <HeroProductCard product={product} index={index} yMotion={yGentle} isEditor={isEditor} />
              </div>
            ))}
          </div>
        )}

        {/* Imagem central grande */}
        {layoutVariant === "centered_big" && heroProducts[0] && (
          <motion.div
            initial={isEditor ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative max-w-3xl mx-auto mb-12 md:mb-16"
          >
            <div data-field="products" data-item-index={0} className={cn("relative aspect-[16/9] w-full overflow-hidden", SOFT.image, SOFT.shadow, SOFT.ring)}>
              <Image src={heroProducts[0].src} alt={heroProducts[0].alt} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <p className="absolute bottom-6 left-6 right-6 text-white/95 text-sm md:text-base font-medium">{heroProducts[0].description}</p>
            </div>
          </motion.div>
        )}

        <motion.div style={opacity ? { opacity } : {}} initial={isEditor ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }} className="text-center">
          {badge && (
            <span
              data-field="badge"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold tracking-wide mb-6"
              style={{
                backgroundColor: badgeColor || (isOnImage || styles.isDark ? "rgba(255,255,255,0.12)" : `color-mix(in srgb, ${accent} 12%, transparent)`),
                color: badgeTextColor || (isOnImage || styles.isDark ? "#FFFFFF" : accent),
                backdropFilter: isOnImage ? "blur(10px)" : undefined,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badgeTextColor || (isOnImage || styles.isDark ? "#FFFFFF" : accent) }} />
              {badge}
            </span>
          )}

          <SectionHeading
            as="h1"
            color={titleColor || (isOnImage ? "#FFFFFF" : "")}
            isDark={styles.isDark}
            dataField="title"
            className="text-[clamp(2.5rem,6vw,4.5rem)] mb-6 mx-auto max-w-3xl"
          >
            {title}
          </SectionHeading>

          <Lede
            color={subtitleColor || (isOnImage ? "rgba(255,255,255,0.9)" : "")}
            isDark={styles.isDark}
            dataField="subtitle"
            className="mb-10 max-w-xl mx-auto text-lg md:text-xl"
          >
            {subtitle}
          </Lede>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <div data-field="ctaText" className="inline-block">
              <SoftButton href={ctaLink} bgColor={btnBgColor} textColor={btnTextColor} isDark={styles.isDark || isOnImage} className="px-8 py-4 text-base">
                <span>{ctaText}</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </SoftButton>
            </div>
            <div data-field="ctaSecondaryText" className="inline-block">
              <SoftButton
                href={ctaSecondaryLink}
                variant="secondary"
                isDark={styles.isDark || isOnImage}
                textColor={secondaryBtnTextColor}
                borderColor={secondaryBtnBorderColor}
                className="px-8 py-4 text-base"
              >
                <span>{ctaSecondaryText}</span>
              </SoftButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface HeroProductProps { product: HeroProduct; index: number; yMotion: MotionValue<number>; isEditor?: boolean; }
function HeroProductCard({ product, index, yMotion, isEditor }: HeroProductProps) {
  const [hovered, setHovered] = useState(false);
  const isCenter = index === 1;
  const rotation = index === 0 ? -6 : index === 2 ? 6 : 0;
  const delay = index === 1 ? 0.2 : index === 0 ? 0.32 : 0.38;
  return (
    <motion.div
      style={{ y: yMotion }}
      initial={isEditor ? false : { opacity: 0, y: 40, rotate: rotation * 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={cn("relative flex-shrink-0", isCenter ? "z-20" : "z-10")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div initial={false} animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }} transition={{ duration: 0.2 }} className="absolute -top-14 left-1/2 -translate-x-1/2 w-48 pointer-events-none z-30">
        <div className="bg-text-900 text-white text-xs font-medium px-4 py-2.5 rounded-2xl shadow-xl text-center leading-snug">{product.description}</div>
      </motion.div>
      {product.src && (
        <div className={cn("overflow-hidden bg-white transition-transform duration-300", SOFT.image, SOFT.shadow, SOFT.ring, isCenter ? "w-[120px] md:w-[170px]" : "w-[88px] md:w-[120px]")} style={{ transform: hovered ? "translateY(-4px)" : "none" }}>
          <Image src={product.src} alt={product.alt} width={300} height={400} priority className="w-full h-auto object-cover aspect-[3/4]" />
        </div>
      )}
    </motion.div>
  );
}
