"use client";

import { motion } from "framer-motion";
import { getSectionStyles } from "@/utils/sectionStyles";

interface TextBlockProps {
  props: {
    title?: string;
    content?: string;
    section_bg_type?: string;
    section_padding?: string;
    titleColor?: string;
    subtitleColor?: string;
    accentColor?: string;
    [key: string]: any;
  };
}

export function TextBlock({ props }: TextBlockProps) {
  const styles = getSectionStyles(props || {});
  const { title, content } = props;

  // Cores dinâmicas — tokens semânticos
  const titleColor = props?.titleColor || "";
  const subtitleColor = props?.subtitleColor || "";
  const accentColor = props?.accentColor || "";

  // Resolve a cor de links dinâmicos
  const linkColor = accentColor || 'var(--color-primary)';

  return (
    <section className={`relative overflow-hidden ${styles.container}`} style={styles.style}>
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-black mb-6"
            style={{ color: titleColor || (styles.isDark ? '#FFFFFF' : 'var(--color-text-900)') }}
          >
            {title}
          </motion.h2>
        )}

        {content && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="prose prose-lg max-w-none"
            style={{ 
              color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.8)' : 'var(--color-text-600)'),
              '--tw-prose-headings': titleColor || (styles.isDark ? '#FFFFFF' : 'var(--color-text-900)'),
              '--tw-prose-links': linkColor,
              '--tw-prose-bold': styles.isDark ? '#FFFFFF' : 'var(--color-text-900)',
              '--tw-prose-quotes': styles.isDark ? 'rgba(255,255,255,0.6)' : undefined,
            } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </section>
  );
}

export default TextBlock;
