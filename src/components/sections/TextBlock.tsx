"use client";

import { motion } from "framer-motion";

interface TextBlockProps {
  props: {
    title?: string;
    content?: string;
  };
}

export function TextBlock({ props }: TextBlockProps) {
  const { title, content } = props;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-black text-text-900 mb-6"
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
            className="prose prose-lg max-w-none text-text-600 prose-headings:text-text-900 prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </section>
  );
}

export default TextBlock;
