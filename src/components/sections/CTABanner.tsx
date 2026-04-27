"use client";

import { motion } from "framer-motion";

interface CTABannerProps {
  props: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundColor?: string;
  };
}

export function CTABanner({ props }: CTABannerProps) {
  const {
    title = "Faça seu pedido agora!",
    description,
    buttonText = "Saiba mais",
    buttonLink = "#",
    backgroundColor = "#A8151F",
  } = props;

  return (
    <section
      className="py-16 md:py-20"
      style={{ backgroundColor }}
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-black text-white mb-4"
        >
          {title}
        </motion.h2>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/80 text-lg mb-8 max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        )}

        <motion.a
          href={buttonLink}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-white text-text-900 font-bold px-8 py-3.5 rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          {buttonText}
        </motion.a>
      </div>
    </section>
  );
}

export default CTABanner;
