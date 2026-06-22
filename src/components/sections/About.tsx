"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import DOMPurify from "isomorphic-dompurify";
import { getSectionStyles, SOFT } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./primitives/Eyebrow";
import { SectionHeading } from "./primitives/SectionHeading";
import { SoftButton } from "./primitives/SoftButton";

interface AboutProps {
  settings?: Record<string, string>;
  props?: Record<string, any>;
  isEditor?: boolean;
}

export function About({ props: editorProps, isEditor }: AboutProps) {
  const styles = getSectionStyles(editorProps || {});
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const eyebrow = (editorProps?.eyebrow as string) ?? "A nossa história";
  const title = (editorProps?.title as string) || "Nossa História";
  const text = (editorProps?.content as string) || "Nascemos com o sonho de oferecer o melhor para nossos clientes. Com dedicação e paixão, construímos uma trajetória de sucesso e tradição no mercado.";
  const buttonText = (editorProps?.buttonText as string) || "Conheça a história completa";
  const buttonLink = (editorProps?.buttonLink as string) || "#";
  const imageSrc = (editorProps?.image as string) || "https://placehold.co/800x800/eeeeee/999999?text=Nossa+Historia";
  const isHtml = text.includes("<");

  // Cores dinâmicas — tokens semânticos
  const titleColor = (editorProps?.titleColor as string) || "";
  const subtitleColor = (editorProps?.subtitleColor as string) || "";
  const accentColor = (editorProps?.accentColor as string) || "";
  const eyebrowColor = (editorProps?.eyebrowColor as string) || "";
  const btnBgColor = (editorProps?.btnBgColor as string) || "";
  const btnTextColor = (editorProps?.btnTextColor as string) || "";
  const decalNumber = (editorProps?.decalNumber as string) || "10";
  const decalLabel = (editorProps?.decalLabel as string) || "Anos";
  const decalText = (editorProps?.decalText as string) || "De Excelência";
  const decalBgColor = (editorProps?.decalBgColor as string) || "";
  const decalNumberColor = (editorProps?.decalNumberColor as string) || "";
  const decalTextColor = (editorProps?.decalTextColor as string) || "";

  return (
    <section id="sobre" ref={ref} className={cn("relative overflow-hidden", styles.container)} style={styles.style}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Texto */}
          <motion.div
            initial={isEditor ? false : { opacity: 0, y: 16 }}
            animate={isEditor || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {eyebrow && (
              <div className="mb-5">
                <Eyebrow color={eyebrowColor || accentColor} isDark={styles.isDark} dataField="eyebrow">{eyebrow}</Eyebrow>
              </div>
            )}

            <SectionHeading color={titleColor} isDark={styles.isDark} dataField="title" className="mb-7">
              {title}
            </SectionHeading>

            <div
              data-field="content"
              className="space-y-5 text-base md:text-lg leading-relaxed mb-10"
              style={{ color: subtitleColor || (styles.isDark ? "rgba(255,255,255,0.8)" : "var(--color-text-500)") }}
            >
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text) }} />
              ) : (
                text.split("\n").map((paragraph, i) => <p key={i}>{paragraph}</p>)
              )}
            </div>

            <div data-field="buttonText" className="inline-block">
              <SoftButton href={buttonLink} target="_blank" bgColor={btnBgColor} textColor={btnTextColor} isDark={styles.isDark}>
                <span>{buttonText}</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </SoftButton>
            </div>
          </motion.div>

          {/* Imagem + selo */}
          <motion.div
            initial={isEditor ? false : { opacity: 0, scale: 0.97 }}
            animate={isEditor || isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            {/* moldura macia atrás */}
            <div
              className={cn("absolute -inset-3 -rotate-2 z-0", SOFT.image)}
              style={{ backgroundColor: `color-mix(in srgb, ${accentColor || "var(--color-primary)"} 10%, transparent)` }}
            />
            <div data-field="image" className={cn("relative z-10 w-full overflow-hidden bg-white", SOFT.image, SOFT.shadow, SOFT.ring)}>
              <Image
                src={imageSrc}
                alt="Nossa História"
                width={800}
                height={800}
                className="w-full object-cover object-center max-h-[520px]"
              />
            </div>

            {/* Selo macio */}
            <div className={cn("absolute -bottom-5 -left-3 md:-left-6 z-20 p-4 flex items-center gap-3 md:gap-4 bg-white", SOFT.cardSm, SOFT.shadow, SOFT.ring, styles.isDark && "!bg-[#1a1a1a]")}>
              <div
                data-field="decalNumber"
                className="w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-display font-bold text-lg md:text-xl"
                style={{
                  backgroundColor: decalBgColor || accentColor || btnBgColor || "var(--color-primary)",
                  color: decalNumberColor || btnTextColor || "#FFFFFF",
                }}
              >{decalNumber}</div>
              <div>
                <div data-field="decalLabel" className={cn("text-[11px] font-semibold tracking-wide leading-none mb-1", styles.isDark ? "text-white/50" : "text-text-400")} style={decalTextColor ? { color: decalTextColor } : undefined}>{decalLabel}</div>
                <div data-field="decalText" className={cn("font-display font-semibold text-base md:text-lg", styles.isDark ? "text-white" : "text-text-900")} style={decalTextColor ? { color: decalTextColor } : undefined}>{decalText}</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
