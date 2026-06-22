"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useFranchiseModal } from "@/context/FranchiseContext";
import { getSectionStyles, SOFT } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";
import { Eyebrow } from "./primitives/Eyebrow";
import { SectionHeading } from "./primitives/SectionHeading";
import { SoftButton } from "./primitives/SoftButton";

interface FranchiseProps {
  settings?: Record<string, string>;
  props?: Record<string, any>;
}

export function Franchise({ props: editorProps }: FranchiseProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { openModal } = useFranchiseModal();

  const eyebrow = (editorProps?.eyebrow as string) ?? "Expansão";
  const title = (editorProps?.title as string) || "Seja um Franqueado";
  const description = (editorProps?.description as string) || "Faça parte da nossa rede e leve a marca para a sua região.";
  const buttonText = (editorProps?.buttonText as string) || "Quero Abrir uma Unidade";
  const imageSrc = (editorProps?.image as string) || "/imagens_originais/img_mapa-unidades.png.webp";
  const stats = (editorProps?.stats as Array<{ value: string; label: string }>) || [
    { value: "700+", label: "Unidades" },
    { value: "40+", label: "Anos de Sucesso" },
  ];
  const isHtml = description.includes("<");

  const titleColor = (editorProps?.titleColor as string) || "";
  const subtitleColor = (editorProps?.subtitleColor as string) || "";
  const accentColor = (editorProps?.accentColor as string) || "";
  const eyebrowColor = (editorProps?.eyebrowColor as string) || "";
  const btnBgColor = (editorProps?.btnBgColor as string) || "";
  const btnTextColor = (editorProps?.btnTextColor as string) || "";
  const cardBgColor = (editorProps?.cardBgColor as string) || "";
  const cardBorderColor = (editorProps?.cardBorderColor as string) || "";
  const statValueColor = (editorProps?.statValueColor as string) || "";
  const statLabelColor = (editorProps?.statLabelColor as string) || "";

  const styles = getSectionStyles(editorProps || {});
  const tint = accentColor || "var(--color-primary)";

  return (
    <section id="franquia" className={cn("relative overflow-hidden", styles.container)} style={styles.style}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div
          className={cn("overflow-hidden", SOFT.card, SOFT.shadow)}
          style={{
            backgroundColor: cardBgColor || (styles.isDark ? "rgba(255,255,255,0.04)" : `color-mix(in srgb, ${tint} 6%, var(--color-surface-50))`),
            border: `1px solid ${cardBorderColor || (styles.isDark ? "rgba(255,255,255,0.08)" : `color-mix(in srgb, ${tint} 12%, transparent)`)}`,
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Conteúdo */}
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="p-10 md:p-14 lg:p-16 flex flex-col justify-center"
            >
              {eyebrow && (
                <div className="mb-5">
                  <Eyebrow color={eyebrowColor || accentColor} isDark={styles.isDark} dataField="eyebrow">{eyebrow}</Eyebrow>
                </div>
              )}

              <SectionHeading color={titleColor} isDark={styles.isDark} dataField="title" className="mb-6">
                {title}
              </SectionHeading>

              <div
                data-field="description"
                className="space-y-4 text-base md:text-lg leading-relaxed mb-10"
                style={{ color: subtitleColor || (styles.isDark ? "rgba(255,255,255,0.8)" : "var(--color-text-500)") }}
              >
                {isHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }} />
                ) : (
                  description.split("\n").map((p, i) => <p key={i}>{p}</p>)
                )}
              </div>

              {/* Stats como mini-cards macios */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    data-field="stats"
                    data-item-index={index}
                    className={cn("px-5 py-4 bg-white", SOFT.cardSm, SOFT.ring, styles.isDark && "!bg-white/5")}
                  >
                    <div
                      className="text-3xl md:text-4xl font-display font-bold mb-1"
                      style={{ color: statValueColor || titleColor || (styles.isDark ? "#FFFFFF" : "var(--color-text-900)") }}
                    >{stat.value}</div>
                    <div
                      className="text-xs font-semibold tracking-wide"
                      style={{ color: statLabelColor || accentColor || (styles.isDark ? "rgba(255,255,255,0.6)" : "var(--color-text-400)") }}
                    >{stat.label}</div>
                  </div>
                ))}
              </div>

              <div data-field="buttonText" className="inline-block">
                <SoftButton onClick={openModal} bgColor={btnBgColor} textColor={btnTextColor} isDark={styles.isDark} className="w-full sm:w-auto px-9 py-4 text-base">
                  <span>{buttonText}</span>
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </SoftButton>
              </div>
            </motion.div>

            {/* Imagem */}
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative min-h-[280px] lg:min-h-full flex items-center justify-center p-8 lg:p-10"
            >
              <div data-field="image" className={cn("relative w-full h-full min-h-[240px] lg:min-h-[380px] overflow-hidden bg-white/40", SOFT.image, SOFT.ring)}>
                <Image src={imageSrc} alt="Mapa de unidades" fill className="object-contain object-center" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
