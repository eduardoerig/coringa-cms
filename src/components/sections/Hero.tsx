"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { getSectionStyles } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";

interface HeroProduct { src: string; alt: string; description: string; }
interface HeroProps { settings?: Record<string, string>; props?: Record<string, any>; }

export function Hero({ settings, props: editorProps }: HeroProps) {
  const styles = getSectionStyles(editorProps || {});
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const layoutVariant = (editorProps?.layout_variant as string) || "floating";
  const backgroundImage = (editorProps?.backgroundImage as string);
  const overlayOpacity = parseInt((editorProps?.overlayOpacity as string) || "40") / 100;

  const title = (editorProps?.title as string) || "Transformamos ideias em experiências";
  const subtitle = (editorProps?.subtitle as string) || "Descubra nossos produtos e serviços feitos com dedicação e paixão.";
  const badge = (editorProps?.badge as string) || "Qualidade & Excelência";
  const ctaText = (editorProps?.ctaText as string) || "Ver Produtos";
  const ctaLink = (editorProps?.ctaLink as string) || "#cardapio";
  const ctaSecondaryText = (editorProps?.ctaSecondaryText as string) || "Saiba Mais";
  const ctaSecondaryLink = (editorProps?.ctaSecondaryLink as string) || "#sobre";
  
  const providedProducts = editorProps?.products as HeroProduct[];
  const heroProducts = (providedProducts && providedProducts.length > 0) ? providedProducts : [
    {
      src: "https://images.pexels.com/photos/3985330/pexels-photo-3985330.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "Harmonização Facial",
      description: "Tratamentos faciais avançados para realçar sua beleza natural."
    },
    {
      src: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "Experiência Spa",
      description: "Momentos de relaxamento profundo no único spa urbano da região."
    },
    {
      src: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "Massagem Terapêutica",
      description: "Recupere suas energias com nossas terapias integradas e massagens."
    }
  ];

  return (
    <section 
      ref={containerRef} 
      id="hero-section" 
      className={cn(
        "relative min-h-[90vh] flex items-center justify-center overflow-hidden",
        layoutVariant === "full_bg" ? "text-white" : styles.container
      )} 
      style={layoutVariant === "full_bg" ? {} : styles.style}
    >
      {/* Background for Full BG Variant */}
      {layoutVariant === "full_bg" && backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image 
            src={backgroundImage} 
            alt="Hero Background" 
            fill 
            className="object-cover"
            priority
          />
          <div 
            className="absolute inset-0 bg-black" 
            style={{ opacity: overlayOpacity }}
          />
        </div>
      )}

      {/* Background Decorative Elements for other variants */}
      {layoutVariant !== "full_bg" && (
        <div className="absolute inset-0 z-0">
          <div className={`absolute top-1/4 -left-20 w-96 h-96 ${styles.isDark ? 'bg-white/5' : 'bg-primary-soft/40'} rounded-full blur-[120px]`} />
          <div className={`absolute bottom-1/4 -right-20 w-80 h-80 ${styles.isDark ? 'bg-white/5' : 'bg-primary-soft/30'} rounded-full blur-[100px]`} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        {/* Variant: Floating Products */}
        {layoutVariant === "floating" && heroProducts.length > 0 && (
          <div className="relative flex items-end justify-center gap-6 md:gap-10 lg:gap-14 max-w-3xl mx-auto mb-12 md:mb-16">
            {heroProducts.slice(0, 3).map((product: HeroProduct, index: number) => (
              <HeroProduct key={product.alt + index} product={product} index={index} yMotion={index === 0 ? y1 : index === 1 ? y2 : y3} />
            ))}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 50, damping: 10 }} className={`absolute w-[220px] h-[220px] md:w-[350px] md:h-[350px] ${styles.isDark ? 'bg-white/10' : 'bg-primary-soft/15'} rounded-full -z-10 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
          </div>
        )}

        {/* Variant: Centered Big Image */}
        {layoutVariant === "centered_big" && heroProducts[0] && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative max-w-4xl mx-auto mb-12 md:mb-16"
          >
            <div className="relative aspect-[16/9] w-full rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
              <Image 
                src={heroProducts[0].src} 
                alt={heroProducts[0].alt} 
                fill 
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-left">
                <p className="text-white/90 text-sm md:text-base font-medium">{heroProducts[0].description}</p>
              </div>
            </div>
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2] 
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -inset-4 bg-primary/20 blur-3xl -z-10 rounded-full" 
            />
          </motion.div>
        )}

        <motion.div style={{ opacity }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }} className="text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.7 }} 
            className={cn(
              "inline-block font-bold text-xs uppercase tracking-[0.3em] mb-5 px-5 py-2.5 rounded-full border",
              layoutVariant === "full_bg" 
                ? "text-white border-white/20 bg-white/10 backdrop-blur-md" 
                : styles.isDark ? 'text-white border-white/20 bg-white/10' : 'text-primary border-primary/10 bg-primary-bg'
            )}
          >
            {badge}
          </motion.span>
          
          <h1 className={cn(
            "text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[0.9] mb-6",
            layoutVariant === "full_bg" ? "text-white drop-shadow-lg" : styles.isDark ? 'text-white' : 'text-text-900'
          )}>
            {title}
          </h1>
          
          <p className={cn(
            "text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto",
            layoutVariant === "full_bg" ? "text-white/90 drop-shadow-md" : styles.isDark ? 'text-white/80' : 'text-text-500'
          )}>
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <a href={ctaLink} className="group relative px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-primary hover:bg-primary-hover transition-all duration-300 flex items-center gap-2 overflow-hidden">
              <span className="relative z-10">{ctaText}</span>
              <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </a>
            <a 
              href={ctaSecondaryLink} 
              className={cn(
                "px-8 py-4 border font-bold rounded-2xl transition-all duration-300",
                layoutVariant === "full_bg"
                  ? "border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                  : styles.isDark ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white' : 'border-text-100 bg-white/50 backdrop-blur-md text-text-900 hover:bg-white hover:border-primary'
              )}
            >
              {ctaSecondaryText}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface HeroProductProps { product: HeroProduct; index: number; yMotion: MotionValue<number>; }
function HeroProduct({ product, index, yMotion }: HeroProductProps) {
  const [hovered, setHovered] = useState(false);
  const isCenter = index === 1;
  const rotation = index === 0 ? -10 : index === 2 ? 10 : 0;
  const delay = index === 1 ? 0.2 : index === 0 ? 0.35 : 0.4;
  return (
    <motion.div style={{ y: yMotion }} initial={{ opacity: 0, y: 50, rotate: rotation * 2 }} animate={{ opacity: 1, y: 0, rotate: rotation }} transition={{ duration: 0.9, delay, ease: "circOut" }} className={`relative flex-shrink-0 ${isCenter ? 'z-20' : 'z-10'}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.div initial={false} animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8, scale: hovered ? 1 : 0.95 }} transition={{ duration: 0.2 }} className="absolute -top-16 md:-top-20 left-1/2 -translate-x-1/2 w-48 md:w-56 pointer-events-none z-30">
        <div className="bg-text-900 text-white text-xs md:text-sm font-medium px-4 py-2.5 rounded-xl shadow-xl text-center leading-snug">{product.description}<div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-text-900 rotate-45 rounded-sm" /></div>
      </motion.div>
      {product.src && (
        <Image 
          src={product.src} 
          alt={product.alt} 
          width={300} 
          height={400} 
          priority 
          className={`${isCenter ? 'w-[100px] md:w-[140px] lg:w-[170px]' : 'w-[70px] md:w-[100px] lg:w-[120px]'} h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:scale-110 transition-transform duration-400 cursor-pointer`} 
        />
      )}
    </motion.div>
  );
}
