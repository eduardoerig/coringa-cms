import type { TemplateSection } from "@/stores/editorStore";

/**
 * Template = combo de seções pré-configuradas, inserível com 1 clique.
 *
 * Cada seção é só `{ type, props? }`: os ids são gerados na inserção e os props
 * informados são mesclados sobre os `defaultProps` do registry (ver
 * `addTemplate` no editorStore). Use apenas tipos SEM `maxInstances` para que o
 * template possa ser inserido quantas vezes o usuário quiser.
 */
export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  /** Categoria para filtro na galeria. */
  category: "Conteúdo" | "Conversão" | "Estrutura";
  /** Emoji/símbolo exibido no card (prévia leve, sem depender de imagem). */
  glyph: string;
  sections: TemplateSection[];
}

export const pageTemplates: PageTemplate[] = [
  {
    id: "sobre-cta",
    name: "Sobre + Chamada",
    description: "Bloco institucional seguido de uma chamada para ação.",
    category: "Conteúdo",
    glyph: "📖",
    sections: [
      {
        type: "about",
        props: {
          eyebrow: "Quem somos",
          title: "Uma história feita de dedicação",
          content: "<p>Conte aqui a trajetória da sua marca, seus valores e o que torna o seu trabalho único.</p>",
          buttonText: "Saiba mais",
        },
      },
      {
        type: "cta_banner",
        props: {
          title: "Pronto para começar?",
          description: "Fale com a nossa equipe e descubra como podemos ajudar.",
          buttonText: "Falar agora",
        },
      },
    ],
  },
  {
    id: "galeria-cta",
    name: "Galeria + Chamada",
    description: "Mostra trabalhos em grade e converte logo abaixo.",
    category: "Conteúdo",
    glyph: "🖼️",
    sections: [
      {
        type: "gallery",
        props: { title: "Nossos trabalhos" },
      },
      {
        type: "cta_banner",
        props: {
          title: "Gostou do que viu?",
          description: "Garanta o seu horário sem compromisso.",
          buttonText: "Agendar",
        },
      },
    ],
  },
  {
    id: "texto-galeria",
    name: "Texto + Galeria",
    description: "Introdução em texto livre acompanhada de uma galeria.",
    category: "Conteúdo",
    glyph: "📝",
    sections: [
      {
        type: "text_block",
        props: {
          title: "Sobre este espaço",
          content: "<p>Use este bloco para apresentar um tema, serviço ou novidade com texto formatado.</p>",
        },
      },
      { type: "gallery", props: { title: "Galeria" } },
    ],
  },
  {
    id: "cta-simples",
    name: "Chamada de ação",
    description: "Um banner de conversão direto e objetivo.",
    category: "Conversão",
    glyph: "📣",
    sections: [
      {
        type: "cta_banner",
        props: {
          title: "Faça seu pedido agora!",
          description: "Atendimento rápido e sem complicação.",
          buttonText: "Pedir agora",
        },
      },
    ],
  },
];
