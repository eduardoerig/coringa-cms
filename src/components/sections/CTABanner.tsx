"use client";

import { motion } from "framer-motion";
import { getSectionStyles } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CTABannerProps {
  props: Record<string, any>;
  isEditor?: boolean;
}

export function CTABanner({ props: editorProps, isEditor }: CTABannerProps) {
  const styles = getSectionStyles(editorProps || {});
  const {
    title = "Faça seu pedido agora!",
    description,
    buttonText = "Saiba mais",
    buttonLink = "#",
  } = editorProps;

  // Cores dinâmicas — tokens semânticos
  const titleColor = (editorProps?.titleColor as string) || "";
  const subtitleColor = (editorProps?.subtitleColor as string) || "";
  const btnBgColor = (editorProps?.btnBgColor as string) || "";
  const btnTextColor = (editorProps?.btnTextColor as string) || "";

  return (
    <section className={cn("relative overflow-hidden", styles.container)} style={styles.style}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          initial={isEditor ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-black mb-4"
          style={{ color: titleColor || (styles.isDark ? '#FFFFFF' : 'var(--color-text-900)') }}
        >
          {title}
        </motion.h2>

        {description && (
          <motion.p
            initial={isEditor ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg mb-8 max-w-2xl mx-auto"
            style={{ color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.8)' : 'var(--color-text-500)') }}
          >
            {description}
          </motion.p>
        )}

        <CTAButton
          href={buttonLink}
          bgColor={btnBgColor}
          textColor={btnTextColor}
          isDark={styles.isDark}
          isEditor={isEditor}
        >
          {buttonText}
        </CTAButton>
      </div>
    </section>
  );
}

// Botão CTA com hover dinâmico
function CTAButton({ href, bgColor, textColor, isDark, isEditor, children }: {
  href: string; bgColor: string; textColor: string; isDark: boolean; isEditor?: boolean; children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const baseBg = bgColor || (isDark ? '#FFFFFF' : 'var(--color-primary)');
  const baseText = textColor || (isDark ? 'var(--color-text-900)' : '#FFFFFF');

  return (
    <motion.a
      href={href}
      initial={isEditor ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full transition-all duration-300"
      style={{
        backgroundColor: baseBg,
        color: baseText,
        filter: hovered ? 'brightness(0.88)' : 'brightness(1)',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: hovered ? '0 25px 50px -12px rgba(0,0,0,0.2)' : `0 10px 20px -6px rgba(0,0,0,0.12)`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </motion.a>
  );
}

export default CTABanner;
