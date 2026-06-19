import { Hero } from "@/components/sections/Hero";
import { Highlights } from "@/components/sections/Highlights";
import { MenuSection } from "@/components/sections/MenuSection";
import { About } from "@/components/sections/About";
import { Franchise } from "@/components/sections/Franchise";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { Gallery } from "@/components/sections/Gallery";
import { CTABanner } from "@/components/sections/CTABanner";
import { TextBlock } from "@/components/sections/TextBlock";
import { Navbar } from "@/components/layout/Navbar";
import { FooterBlock } from "@/components/sections/FooterBlock";
import {
  Layout,
  PanelTopOpen,
  PanelBottomOpen,
  LayoutGrid,
  Star,
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
  /** Classificação do campo: "content" ou "appearance" */
  category?: "content" | "appearance";
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
  /** Imagem de preview para a biblioteca */
  previewImage?: string;
}

// Mapeamento de componentes para o editor e landing
export const sectionComponentMap: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  highlights: Highlights,
  menu: MenuSection,
  about: About,
  franchise: Franchise,
  divider: ScrollIndicator,
  gallery: Gallery,
  cta_banner: CTABanner,
  text_block: TextBlock,
  header: Navbar,
  footer: FooterBlock,
};

import { getSectionStyles } from "@/utils/sectionStyles";
export { getSectionStyles };

// ---- Campos Comuns de Aparência (Unificados) ----

/** 5 tokens semânticos de cor + padding + fundo — presentes em TODAS as seções */
const COMMON_APPEARANCE_FIELDS: PropField[] = [
  {
    key: "section_bg_type",
    label: "Cor de Fundo da Seção",
    type: "color",
    placeholder: "#FFFFFF",
    category: "appearance",
  },
  {
    key: "section_padding",
    label: "Espaçamento (Padding)",
    type: "select",
    options: [
      { value: "small", label: "Pequeno" },
      { value: "medium", label: "Médio" },
      { value: "large", label: "Grande" },
      { value: "none", label: "Nenhum" },
    ],
    category: "appearance",
  },
  { key: "titleColor", label: "Cor dos Títulos", type: "color", placeholder: "Automático", category: "appearance" },
  { key: "subtitleColor", label: "Cor dos Textos", type: "color", placeholder: "Automático", category: "appearance" },
  { key: "accentColor", label: "Cor de Destaque (Tags/Ícones/Links)", type: "color", placeholder: "Automático", category: "appearance" },
  { key: "btnBgColor", label: "Cor dos Botões", type: "color", placeholder: "Automático", category: "appearance" },
  { key: "btnTextColor", label: "Cor do Texto dos Botões", type: "color", placeholder: "Automático", category: "appearance" },
];

const COMMON_APPEARANCE_DEFAULTS = {
  section_bg_type: "#FFFFFF",
  section_padding: "medium",
  titleColor: "",
  subtitleColor: "",
  accentColor: "",
  btnBgColor: "",
  btnTextColor: "",
};

// ---- Registro ----

export const sectionRegistry: Record<string, SectionRegistryEntry> = {
  header: {
    type: "header",
    label: "Cabeçalho",
    description: "Navegação principal e logo do site",
    icon: PanelTopOpen,
    fields: [
      { key: "site_name", label: "Nome do Site", type: "text" },
      { key: "logo_url", label: "Logo URL", type: "image" },
      { key: "cta_label", label: "Texto do Botão (CTA)", type: "text" },
      { key: "cta_link", label: "Link do Botão (CTA)", type: "url" },
      {
        key: "links",
        label: "Links de Navegação",
        type: "array",
        itemFields: [
          { key: "label", label: "Texto", type: "text" },
          { key: "url", label: "URL", type: "text" },
        ],
      },
      // Aparência
      { key: "bgColor", label: "Cor de Fundo (Fixo)", type: "color", category: "appearance" },
      { key: "textColor", label: "Cor do Texto/Links", type: "color", category: "appearance" },
      { key: "ctaBgColor", label: "Cor de Fundo do Botão CTA", type: "color", category: "appearance" },
      { key: "ctaTextColor", label: "Cor do Texto do Botão CTA", type: "color", category: "appearance" },
    ],
    defaultProps: {
      site_name: "",
      logo_url: "",
      cta_label: "Fale Conosco",
      cta_link: "#",
      links: [
        { label: "Início", url: "#hero-section" },
        { label: "Serviços", url: "#produtos" },
        { label: "Sobre", url: "#sobre" },
        { label: "Franquia", url: "#franquia" },
      ],
    },
    maxInstances: 1,
  },
  hero: {
    type: "hero",
    label: "Hero (Banner)",
    description: "Banner principal com produtos, título e botões de ação",
    icon: Layout,
    maxInstances: 1,
    previewImage: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop",
    fields: [
      // Conteúdo
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
      // Aparência
      {
        key: "layout_variant",
        label: "Modelo de Layout",
        type: "select",
        category: "appearance",
        options: [
          { value: "floating", label: "Imagens Flutuantes (Padrão)" },
          { value: "centered_big", label: "Imagem Central Grande" },
          { value: "full_bg", label: "Fundo Total com Overlay" },
        ],
      },
      { key: "backgroundImage", label: "Imagem de Fundo (para Fundo Total)", type: "image", category: "appearance" },
      { key: "overlayOpacity", label: "Opacidade do Overlay (0-100)", type: "text", placeholder: "40", category: "appearance" },
      { key: "badgeColor", label: "Cor de Fundo do Badge", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "badgeTextColor", label: "Cor do Texto do Badge", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "secondaryBtnBorderColor", label: "Cor Borda Botão Secundário", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "secondaryBtnTextColor", label: "Cor Texto Botão Secundário", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "secondaryBtnBgColor", label: "Cor Fundo Botão Secundário", type: "color", placeholder: "Automático", category: "appearance" },
      ...COMMON_APPEARANCE_FIELDS,
    ],
    defaultProps: {
      badge: "Qualidade Premium",
      title: "A solução que conquista o mercado",
      subtitle: "Transformando ideias em resultados extraordinários.",
      ctaText: "Ver Produtos",
      ctaLink: "#produtos",
      ctaSecondaryText: "Saiba Mais",
      ctaSecondaryLink: "#destaques",
      products: [
        { src: "https://placehold.co/600x400/png", alt: "Produto A", description: "Qualidade garantida e excelência." },
        { src: "https://placehold.co/600x400/png", alt: "Produto B", description: "Inovação e performance." },
        { src: "https://placehold.co/600x400/png", alt: "Produto C", description: "Feito para a sua melhor experiência." },
      ],
      layout_variant: "floating",
      backgroundImage: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1",
      overlayOpacity: "40",
      badgeColor: "",
      badgeTextColor: "",
      secondaryBtnBorderColor: "",
      secondaryBtnTextColor: "",
      ...COMMON_APPEARANCE_DEFAULTS,
    },
  },

  highlights: {
    type: "highlights",
    label: "Destaques",
    description: "Carrossel de produtos em destaque (puxa do banco)",
    icon: Star,
    maxInstances: 1,
    previewImage: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=600&auto=format&fit=crop",
    fields: [
      { key: "title", label: "Título", type: "text", placeholder: "Nossos Queridinhos" },
      { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Descubra os sabores..." },
      // Aparência
      { key: "cardBgColor", label: "Cor de Fundo dos Cards", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "cardBorderColor", label: "Cor da Borda dos Cards", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "tagBgColor", label: "Cor de Fundo da Tag", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "tagTextColor", label: "Cor do Texto da Tag", type: "color", placeholder: "Automático", category: "appearance" },
      ...COMMON_APPEARANCE_FIELDS,
    ],
    defaultProps: {
      title: "Nossos Queridinhos",
      subtitle: "Conheça os produtos em destaque da nossa marca.",
      cardBgColor: "",
      cardBorderColor: "",
      tagBgColor: "",
      tagTextColor: "",
      ...COMMON_APPEARANCE_DEFAULTS,
    },
  },

  menu: {
    type: "menu",
    label: "Produtos / Catálogo",
    description: "Grade de produtos com filtro por categorias",
    icon: LayoutGrid,
    maxInstances: 1,
    previewImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop",
    fields: [
      { key: "title", label: "Título", type: "text", placeholder: "Explore nosso Cardápio" },
      { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Mais de 100 opções..." },
      // Aparência
      { key: "cardBgColor", label: "Cor de Fundo dos Cards", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "filterActiveBgColor", label: "Cor de Fundo do Filtro Ativo", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "filterActiveTextColor", label: "Cor do Texto do Filtro Ativo", type: "color", placeholder: "Automático", category: "appearance" },
      ...COMMON_APPEARANCE_FIELDS,
    ],
    defaultProps: {
      title: "Explore nosso Cardápio",
      subtitle: "Mais de 100 opções preparadas com carinho para você.",
      cardBgColor: "",
      filterActiveBgColor: "",
      filterActiveTextColor: "",
      ...COMMON_APPEARANCE_DEFAULTS,
    },
  },

  about: {
    type: "about",
    label: "Sobre Nós",
    description: "Seção institucional com texto, imagem e botão de ação",
    icon: BookOpen,
    previewImage: "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=600&auto=format&fit=crop",
    fields: [
      { key: "title", label: "Título", type: "text", placeholder: "Nossa História" },
      { key: "content", label: "Conteúdo", type: "richtext" },
      { key: "buttonText", label: "Texto do Botão", type: "text", placeholder: "Saiba mais" },
      { key: "buttonLink", label: "Link do Botão", type: "url", placeholder: "https://..." },
      { key: "image", label: "Imagem", type: "image" },
      { key: "decalNumber", label: "Selo — Número", type: "text", placeholder: "10" },
      { key: "decalLabel", label: "Selo — Sub", type: "text", placeholder: "Anos" },
      { key: "decalText", label: "Selo — Texto", type: "text", placeholder: "De Excelência" },
      ...COMMON_APPEARANCE_FIELDS,
    ],
    defaultProps: {
      title: "Nossa História",
      content: "<p>Conte sua história aqui...</p>",
      buttonText: "Saiba mais",
      buttonLink: "#",
      image: "",
      decalNumber: "10",
      decalLabel: "Anos",
      decalText: "De Excelência",
      ...COMMON_APPEARANCE_DEFAULTS,
    },
  },

  franchise: {
    type: "franchise",
    label: "Franquia",
    description: "Chamada para franqueados com estatísticas e formulário",
    icon: Building2,
    maxInstances: 1,
    previewImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop",
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
      // Aparência
      { key: "cardBgColor", label: "Cor de Fundo do Card", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "cardBorderColor", label: "Cor da Borda do Card", type: "color", placeholder: "Automático", category: "appearance" },
      ...COMMON_APPEARANCE_FIELDS,
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
      cardBgColor: "",
      cardBorderColor: "",
      ...COMMON_APPEARANCE_DEFAULTS,
    },
  },

  gallery: {
    type: "gallery",
    label: "Galeria",
    description: "Grade de imagens com legendas",
    icon: Images,
    previewImage: "https://images.unsplash.com/photo-1513519247352-4d3660dec40c?q=80&w=600&auto=format&fit=crop",
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
      ...COMMON_APPEARANCE_FIELDS,
    ],
    defaultProps: {
      title: "Galeria",
      images: [],
      ...COMMON_APPEARANCE_DEFAULTS,
    },
  },

  cta_banner: {
    type: "cta_banner",
    label: "Banner CTA",
    description: "Banner de chamada para ação com cor de fundo",
    icon: Megaphone,
    previewImage: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=600&auto=format&fit=crop",
    fields: [
      { key: "title", label: "Título", type: "text", placeholder: "Faça seu pedido agora!" },
      { key: "description", label: "Descrição", type: "textarea" },
      { key: "buttonText", label: "Texto do Botão", type: "text", placeholder: "Pedir Agora" },
      { key: "buttonLink", label: "Link do Botão", type: "url" },
      ...COMMON_APPEARANCE_FIELDS,
    ],
    defaultProps: {
      title: "Faça seu pedido agora!",
      description: "Entre em contato e saiba mais.",
      buttonText: "Pedir Agora",
      buttonLink: "#",
      ...COMMON_APPEARANCE_DEFAULTS,
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
      ...COMMON_APPEARANCE_FIELDS,
    ],
    defaultProps: {
      title: "",
      content: "<p>Escreva seu conteúdo aqui...</p>",
      ...COMMON_APPEARANCE_DEFAULTS,
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
        category: "appearance",
        options: [
          { value: "scroll_arrow", label: "Seta de Scroll" },
          { value: "line", label: "Linha" },
          { value: "space", label: "Espaço" },
          { value: "wave", label: "Onda" },
        ],
      },
      { key: "backgroundColor", label: "Cor de Fundo (Topo)", type: "color", placeholder: "Ex: #FFFFFF", category: "appearance" },
      { key: "fillColor", label: "Cor de Preenchimento (Base/Onda)", type: "color", placeholder: "Ex: #000000", category: "appearance" },
    ],
    defaultProps: {
      style: "space",
      backgroundColor: "",
      fillColor: "",
    },
  },

  footer: {
    type: "footer",
    label: "Rodapé",
    description: "Rodapé do site com links, redes sociais e informações da empresa.",
    icon: PanelBottomOpen,
    fields: [
      { key: "companyName", label: "Nome da Empresa", type: "text", placeholder: "Empresa Exemplo Ltda", category: "content" },
      { key: "cnpj", label: "CNPJ", type: "text", placeholder: "00.000.000/0001-00", category: "content" },
      { key: "description", label: "Descrição", type: "textarea", placeholder: "Oferecemos os melhores produtos...", category: "content" },
      { key: "siteName", label: "Nome do Site", type: "text", placeholder: "Meu Site", category: "content" },
      ...COMMON_APPEARANCE_FIELDS,
    ],
    defaultProps: {
      companyName: "Empresa Exemplo Ltda.",
      cnpj: "",
      description: "Oferecemos os melhores produtos e serviços com qualidade e dedicação.",
      siteName: "Meu Site",
      ...COMMON_APPEARANCE_DEFAULTS,
      section_bg_type: "#FFFFFF",
    },
    maxInstances: 1,
  },
};


/** Lista ordenada para exibir na biblioteca */
export const sectionTypes = Object.values(sectionRegistry);
