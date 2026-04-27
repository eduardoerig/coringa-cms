import {
  Layout,
  Star,
  UtensilsCrossed,
  BookOpen,
  Building2,
  Images,
  Megaphone,
  Type,
  Minus,
} from "lucide-react";

// ---- Tipos ----

export interface PropField {
  key: string;
  label: string;
  type: "text" | "textarea" | "richtext" | "image" | "url" | "color" | "select" | "array";
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Para type: "array" — define os campos de cada item */
  itemFields?: PropField[];
}

export interface SectionRegistryEntry {
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Campos editáveis no painel de propriedades */
  fields: PropField[];
  /** Valores padrão ao adicionar nova seção */
  defaultProps: Record<string, unknown>;
  /** Limite de instâncias (ex: hero = 1) */
  maxInstances?: number;
}

// ---- Registro ----

export const sectionRegistry: Record<string, SectionRegistryEntry> = {
  hero: {
    type: "hero",
    label: "Hero (Banner)",
    description: "Banner principal com produtos, título e botões de ação",
    icon: Layout,
    maxInstances: 1,
    fields: [
      { key: "badge", label: "Badge", type: "text", placeholder: "Qualidade Premium" },
      { key: "title", label: "Título", type: "text", placeholder: "O sabor que conquista o Brasil" },
      { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Desde 1980..." },
      { key: "ctaText", label: "Texto do Botão Principal", type: "text", placeholder: "Ver Cardápio" },
      { key: "ctaLink", label: "Link do Botão Principal", type: "url", placeholder: "#cardapio" },
      { key: "ctaSecondaryText", label: "Texto do Botão Secundário", type: "text", placeholder: "Mais Pedidos" },
      { key: "ctaSecondaryLink", label: "Link do Botão Secundário", type: "url", placeholder: "#destaques" },
      {
        key: "products",
        label: "Produtos do Hero",
        type: "array",
        itemFields: [
          { key: "src", label: "Imagem", type: "image" },
          { key: "alt", label: "Nome", type: "text" },
          { key: "description", label: "Descrição", type: "text" },
        ],
      },
    ],
    defaultProps: {
      badge: "Qualidade Premium",
      title: "A solução que conquista o mercado",
      subtitle: "Transformando ideias em resultados extraordinários.",
      ctaText: "Ver Cardápio",
      ctaLink: "#cardapio",
      ctaSecondaryText: "Mais Pedidos",
      ctaSecondaryLink: "#destaques",
      products: [
        { src: "https://placehold.co/600x400/png", alt: "Produto A", description: "Qualidade garantida e excelência." },
        { src: "https://placehold.co/600x400/png", alt: "Produto B", description: "Inovação e performance." },
        { src: "https://placehold.co/600x400/png", alt: "Produto C", description: "Feito para a sua melhor experiência." },
      ],
    },
  },

  highlights: {
    type: "highlights",
    label: "Destaques",
    description: "Carrossel de produtos em destaque (puxa do banco)",
    icon: Star,
    maxInstances: 1,
    fields: [
      { key: "title", label: "Título", type: "text", placeholder: "Nossos Queridinhos" },
      { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Descubra os sabores..." },
    ],
    defaultProps: {
      title: "Nossos Queridinhos",
      subtitle: "Descubra os sabores que fazem a fama da nossa marca em todo o país.",
    },
  },

  menu: {
    type: "menu",
    label: "Cardápio",
    description: "Grade de produtos com filtro por categorias e download de PDF",
    icon: UtensilsCrossed,
    maxInstances: 1,
    fields: [
      { key: "title", label: "Título", type: "text", placeholder: "Explore nosso Cardápio" },
      { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Mais de 100 opções..." },
    ],
    defaultProps: {
      title: "Explore nosso Cardápio",
      subtitle: "Mais de 100 opções preparadas com carinho para você.",
    },
  },

  about: {
    type: "about",
    label: "Sobre Nós",
    description: "Seção institucional com texto, imagem e botão de ação",
    icon: BookOpen,
    fields: [
      { key: "title", label: "Título", type: "text", placeholder: "Nossa História" },
      { key: "content", label: "Conteúdo", type: "richtext" },
      { key: "buttonText", label: "Texto do Botão", type: "text", placeholder: "Saiba mais" },
      { key: "buttonLink", label: "Link do Botão", type: "url", placeholder: "https://..." },
      { key: "image", label: "Imagem", type: "image" },
    ],
    defaultProps: {
      title: "Nossa História",
      content: "<p>Conte sua história aqui...</p>",
      buttonText: "Saiba mais",
      buttonLink: "#",
      image: "",
    },
  },

  franchise: {
    type: "franchise",
    label: "Franquia",
    description: "Chamada para franqueados com estatísticas e formulário",
    icon: Building2,
    maxInstances: 1,
    fields: [
      { key: "title", label: "Título", type: "text", placeholder: "Seja um Franqueado" },
      { key: "description", label: "Descrição", type: "richtext" },
      { key: "buttonText", label: "Texto do Botão", type: "text", placeholder: "Quero Abrir uma Unidade" },
      { key: "image", label: "Imagem do Mapa", type: "image" },
      {
        key: "stats",
        label: "Estatísticas",
        type: "array",
        itemFields: [
          { key: "value", label: "Valor", type: "text", placeholder: "700+" },
          { key: "label", label: "Label", type: "text", placeholder: "Unidades" },
        ],
      },
    ],
    defaultProps: {
      title: "Seja um Franqueado",
      description: "<p>Faça parte da nossa rede de parceiros.</p>",
      buttonText: "Quero Abrir uma Unidade",
      image: "https://placehold.co/800x600/png",
      stats: [
        { value: "700+", label: "Unidades" },
        { value: "40+", label: "Anos de Sucesso" },
      ],
    },
  },

  gallery: {
    type: "gallery",
    label: "Galeria",
    description: "Grade de imagens com legendas",
    icon: Images,
    fields: [
      { key: "title", label: "Título", type: "text", placeholder: "Galeria" },
      {
        key: "images",
        label: "Imagens",
        type: "array",
        itemFields: [
          { key: "url", label: "Imagem", type: "image" },
          { key: "caption", label: "Legenda", type: "text" },
        ],
      },
    ],
    defaultProps: {
      title: "Galeria",
      images: [],
    },
  },

  cta_banner: {
    type: "cta_banner",
    label: "Banner CTA",
    description: "Banner de chamada para ação com cor de fundo",
    icon: Megaphone,
    fields: [
      { key: "title", label: "Título", type: "text", placeholder: "Faça seu pedido agora!" },
      { key: "description", label: "Descrição", type: "textarea" },
      { key: "buttonText", label: "Texto do Botão", type: "text", placeholder: "Pedir Agora" },
      { key: "buttonLink", label: "Link do Botão", type: "url" },
      { key: "backgroundColor", label: "Cor de Fundo", type: "color" },
    ],
    defaultProps: {
      title: "Faça seu pedido agora!",
      description: "Peça pelo iFood e receba em casa.",
      buttonText: "Pedir Agora",
      buttonLink: "#",
      backgroundColor: "#A8151F",
    },
  },

  text_block: {
    type: "text_block",
    label: "Texto Livre",
    description: "Bloco de texto com formatação rica",
    icon: Type,
    fields: [
      { key: "title", label: "Título", type: "text", placeholder: "Título" },
      { key: "content", label: "Conteúdo", type: "richtext" },
    ],
    defaultProps: {
      title: "",
      content: "<p>Escreva seu conteúdo aqui...</p>",
    },
  },

  divider: {
    type: "divider",
    label: "Divisor",
    description: "Separador visual entre seções",
    icon: Minus,
    fields: [
      {
        key: "style",
        label: "Estilo",
        type: "select",
        options: [
          { value: "scroll_arrow", label: "Seta de Scroll" },
          { value: "line", label: "Linha" },
          { value: "space", label: "Espaço" },
          { value: "wave", label: "Onda" },
        ],
      },
    ],
    defaultProps: {
      style: "space",
    },
  },
};

/** Lista ordenada para exibir na biblioteca */
export const sectionTypes = Object.values(sectionRegistry);
