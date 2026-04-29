"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, useState } from "react";

interface HeroProduct { src: string; alt: string; description: string; }
interface HeroProps { settings?: Record<string, string>; props?: Record<string, unknown>; }

export function Hero({ settings, props: editorProps }: HeroProps) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const title = (editorProps?.title as string) || "Transformamos ideias em experiências";
  const subtitle = (editorProps?.subtitle as string) || "Descubra nossos produtos e serviços feitos com dedicação e paixão.";
  const badge = (editorProps?.badge as string) || "Qualidade & Excelência";
  const ctaText = (editorProps?.ctaText as string) || "Ver Produtos";
  const ctaLink = (editorProps?.ctaLink as string) || "#cardapio";
  const ctaSecondaryText = (editorProps?.ctaSecondaryText as string) || "Saiba Mais";
  const ctaSecondaryLink = (editorProps?.ctaSecondaryLink as string) || "#sobre";
  const heroProducts = (editorProps?.products as HeroProduct[]) || [];

  return (
    <section ref={containerRef} id="hero-section" className="relative min-h-[90vh] flex items-center justify-center pt-36 pb-12 overflow-hidden bg-surface-50">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-soft/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary-soft/30 rounded-full blur-[100px]" />
      </div>
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        {heroProducts.length > 0 && (
          <div className="relative flex items-end justify-center gap-6 md:gap-10 lg:gap-14 max-w-3xl mx-auto mb-12 md:mb-16">
            {heroProducts.map((product, index) => (
              <HeroProduct key={product.alt} product={product} index={index} yMotion={index === 0 ? y1 : index === 1 ? y2 : y3} />
            ))}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 50, damping: 10 }} className="absolute w-[220px] h-[220px] md:w-[350px] md:h-[350px] bg-primary-soft/15 rounded-full -z-10 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        )}
        <motion.div style={{ opacity }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }} className="text-center">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="inline-block text-primary font-bold text-xs uppercase tracking-[0.3em] mb-5 bg-primary-bg px-5 py-2.5 rounded-full border border-primary/10">{badge}</motion.span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-text-900 tracking-tight leading-[0.9] mb-6">{title}</h1>
          <p className="text-text-500 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto">{subtitle}</p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <a href={ctaLink} className="group relative px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-primary hover:bg-primary-hover transition-all duration-300 flex items-center gap-2 overflow-hidden">
              <span className="relative z-10">{ctaText}</span>
              <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </a>
            <a href={ctaSecondaryLink} className="px-8 py-4 border border-text-100 bg-white/50 backdrop-blur-md text-text-900 font-bold rounded-2xl hover:bg-white hover:border-primary transition-all duration-300">{ctaSecondaryText}</a>
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
      <Image src={product.src} alt={product.alt} width={300} height={400} priority className={`${isCenter ? 'w-[100px] md:w-[140px] lg:w-[170px]' : 'w-[70px] md:w-[100px] lg:w-[120px]'} h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:scale-110 transition-transform duration-400 cursor-pointer`} />
    </motion.div>
  );
}
