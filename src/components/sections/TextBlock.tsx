"use client";

import { motion } from "framer-motion";
import { getSectionStyles } from "@/utils/sectionStyles";
import DOMPurify from "isomorphic-dompurify";
import { SectionHeading } from "./primitives/SectionHeading";

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

  const titleColor = props?.titleColor || "";
  const subtitleColor = props?.subtitleColor || "";
  const accentColor = props?.accentColor || "";
  const linkColor = accentColor || "var(--color-primary)";

  return (
    <section className={`relative overflow-hidden ${styles.container}`} style={styles.style}>
      <div className="max-w-2xl mx-auto px-6 relative z-10">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-7"
          >
            <SectionHeading color={titleColor} isDark={styles.isDark} dataField="title">
              {title}
            </SectionHeading>
          </motion.div>
        )}

        {content && (
          <motion.div
            data-field="content"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="prose prose-lg max-w-none prose-blockquote:rounded-2xl prose-blockquote:border-l-4 prose-blockquote:bg-black/[0.03] prose-blockquote:py-1 prose-blockquote:px-5 prose-blockquote:not-italic"
            style={{
              color: subtitleColor || (styles.isDark ? "rgba(255,255,255,0.8)" : "var(--color-text-600)"),
              "--tw-prose-headings": titleColor || (styles.isDark ? "#FFFFFF" : "var(--color-text-900)"),
              "--tw-prose-links": linkColor,
              "--tw-prose-bold": styles.isDark ? "#FFFFFF" : "var(--color-text-900)",
              "--tw-prose-quotes": styles.isDark ? "rgba(255,255,255,0.7)" : "var(--color-text-600)",
            } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          />
        )}
      </div>
    </section>
  );
}

export default TextBlock;
