"use client";

import { motion } from "framer-motion";
import { getSectionStyles } from "@/utils/sectionStyles";

interface TextBlockProps {
  props: {
    title?: string;
    content?: string;
    section_bg_type?: string;
    section_padding?: string;
  };
}

export function TextBlock({ props }: TextBlockProps) {
  const styles = getSectionStyles(props || {});
  const { title, content } = props;

  return (
    <section className={`relative overflow-hidden ${styles.container}`} style={styles.style}>
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-3xl md:text-4xl font-display font-black mb-6 ${styles.isDark ? 'text-white' : 'text-text-900'}`}
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
            className={`prose prose-lg max-w-none 
              ${styles.isDark 
                ? 'text-white/80 prose-headings:text-white prose-a:text-white prose-strong:text-white prose-blockquote:text-white/60' 
                : 'text-text-600 prose-headings:text-text-900 prose-a:text-primary'}`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </section>
  );
}

export default TextBlock;
