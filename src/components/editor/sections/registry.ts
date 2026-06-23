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
import { Container } from "@/components/sections/Container";
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
  Columns3,
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
  /** Elemento (bloco) a que o campo pertence no painel. Ex.: "Título", "Botão", "Seção". */
  group?: string;
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
  container: Container,
};

import { getSectionStyles } from "@/utils/sectionStyles";
export { getSectionStyles };

// ---- Helpers de campos por elemento (cada cor mora no bloco do seu elemento) ----

const TITLE_COLOR: PropField = { key: "titleColor", label: "Cor do título", type: "color", placeholder: "Automático", category: "appearance", group: "Título" };
const EYEBROW_COLOR: PropField = { key: "eyebrowColor", label: "Cor do rótulo", type: "color", placeholder: "Automático", category: "appearance", group: "Rótulo" };
const TEXT_COLOR = (group = "Texto"): PropField => ({ key: "subtitleColor", label: "Cor do texto", type: "color", placeholder: "Automático", category: "appearance", group });
const BTN_COLORS = (group: string): PropField[] => [
  { key: "btnBgColor", label: "Cor do botão", type: "color", placeholder: "Automático", category: "appearance", group },
  { key: "btnTextColor", label: "Cor do texto do botão", type: "color", placeholder: "Automático", category: "appearance", group },
];

/** Campo de seletor de variante de layout (aparece no topo do bloco "Seção"). */
const LAYOUT_VARIANT = (options: { value: string; label: string }[]): PropField => ({
  key: "layout_variant",
  label: "Modelo de layout",
  type: "select",
  category: "appearance",
  group: "Seção",
  options,
});

/** Bloco "Seção" (sempre por último). `extra` entra no topo do bloco. */
const SECTION_GROUP = (extra: PropField[] = []): PropField[] => [
  ...extra,
  { key: "section_bg_type", label: "Cor de fundo da seção", type: "color", placeholder: "#FFFFFF", category: "appearance", group: "Seção" },
  {
    key: "section_padding",
    label: "Espaçamento",
    type: "select",
    category: "appearance",
    group: "Seção",
    options: [
      { value: "small", label: "Pequeno" },
      { value: "medium", label: "Médio" },
      { value: "large", label: "Grande" },
      { value: "none", label: "Nenhum" },
    ],
  },
  { key: "accentColor", label: "Cor de destaque (tags/ícones/links)", type: "color", placeholder: "Automático", category: "appearance", group: "Seção" },
];

// Defaults comuns de aparência (chaves inalteradas)
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
      // Marca
      { key: "site_name", label: "Nome do site", type: "text", group: "Marca" },
      { key: "logo_url", label: "Logo", type: "image", group: "Marca" },
      { key: "bgColor", label: "Cor de fundo", type: "color", category: "appearance", group: "Marca" },
      { key: "textColor", label: "Cor do texto/links", type: "color", category: "appearance", group: "Marca" },
      // Botão CTA
      { key: "cta_label", label: "Texto do botão", type: "text", group: "Botão CTA" },
      { key: "cta_link", label: "Link do botão", type: "url", group: "Botão CTA" },
      { key: "ctaBgColor", label: "Cor do botão", type: "color", category: "appearance", group: "Botão CTA" },
      { key: "ctaTextColor", label: "Cor do texto do botão", type: "color", category: "appearance", group: "Botão CTA" },
      // Links
      {
        key: "links",
        label: "Links de navegação",
        type: "array",
        group: "Links",
        itemFields: [
          { key: "label", label: "Texto", type: "text" },
          { key: "url", label: "URL", type: "text" },
        ],
      },
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
      // Badge
      { key: "badge", label: "Texto", type: "text", placeholder: "Qualidade Premium", group: "Badge" },
      { key: "badgeColor", label: "Cor de fundo", type: "color", placeholder: "Automático", category: "appearance", group: "Badge" },
      { key: "badgeTextColor", label: "Cor do texto", type: "color", placeholder: "Automático", category: "appearance", group: "Badge" },
      // Título
      { key: "title", label: "Título", type: "text", placeholder: "O sabor que conquista o Brasil", group: "Título" },
      TITLE_COLOR,
      // Subtítulo
      { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Desde 1980...", group: "Subtítulo" },
      TEXT_COLOR("Subtítulo"),
      // Botão principal
      { key: "ctaText", label: "Texto", type: "text", placeholder: "Ver Cardápio", group: "Botão principal" },
      { key: "ctaLink", label: "Link", type: "url", placeholder: "#cardapio", group: "Botão principal" },
      ...BTN_COLORS("Botão principal"),
      // Botão secundário
      { key: "ctaSecondaryText", label: "Texto", type: "text", placeholder: "Mais Pedidos", group: "Botão secundário" },
      { key: "ctaSecondaryLink", label: "Link", type: "url", placeholder: "#destaques", group: "Botão secundário" },
      { key: "secondaryBtnBgColor", label: "Cor de fundo", type: "color", placeholder: "Automático", category: "appearance", group: "Botão secundário" },
      { key: "secondaryBtnBorderColor", label: "Cor da borda", type: "color", placeholder: "Automático", category: "appearance", group: "Botão secundário" },
      { key: "secondaryBtnTextColor", label: "Cor do texto", type: "color", placeholder: "Automático", category: "appearance", group: "Botão secundário" },
      // Produtos
      {
        key: "products",
        label: "Produtos do Hero",
        type: "array",
        group: "Produtos",
        itemFields: [
          { key: "src", label: "Imagem", type: "image" },
          { key: "alt", label: "Nome", type: "text" },
          { key: "description", label: "Descrição", type: "text" },
        ],
      },
      // Seção
      ...SECTION_GROUP([
        {
          key: "layout_variant",
          label: "Modelo de layout",
          type: "select",
          category: "appearance",
          group: "Seção",
          options: [
            { value: "floating", label: "Imagens Flutuantes (Padrão)" },
            { value: "centered_big", label: "Imagem Central Grande" },
            { value: "full_bg", label: "Fundo Total com Overlay" },
          ],
        },
        { key: "backgroundImage", label: "Imagem de fundo (Fundo Total)", type: "image", category: "appearance", group: "Seção" },
        { key: "overlayOpacity", label: "Opacidade do overlay (0-100)", type: "text", placeholder: "40", category: "appearance", group: "Seção" },
      ]),
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
      secondaryBtnBgColor: "",
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
      { key: "eyebrow", label: "Rótulo (eyebrow)", type: "text", placeholder: "Destaques", group: "Rótulo" },
      EYEBROW_COLOR,
      { key: "title", label: "Título", type: "text", placeholder: "Nossos Queridinhos", group: "Título" },
      TITLE_COLOR,
      { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Descubra os sabores...", group: "Subtítulo" },
      TEXT_COLOR("Subtítulo"),
      // Cards
      { key: "cardBgColor", label: "Cor de fundo dos cards", type: "color", placeholder: "Automático", category: "appearance", group: "Cards" },
      { key: "cardBorderColor", label: "Cor da borda dos cards", type: "color", placeholder: "Automático", category: "appearance", group: "Cards" },
      { key: "tagBgColor", label: "Cor de fundo da tag", type: "color", placeholder: "Automático", category: "appearance", group: "Cards" },
      { key: "tagTextColor", label: "Cor do texto da tag", type: "color", placeholder: "Automático", category: "appearance", group: "Cards" },
      // Seção (cor do botão controla setas/dots)
      ...SECTION_GROUP([
        LAYOUT_VARIANT([
          { value: "carousel", label: "Carrossel (Padrão)" },
          { value: "grid", label: "Grade estática" },
        ]),
        ...BTN_COLORS("Seção"),
      ]),
    ],
    defaultProps: {
      layout_variant: "carousel",
      eyebrow: "Destaques",
      title: "Nossos Queridinhos",
      subtitle: "Conheça os produtos em destaque da nossa marca.",
      eyebrowColor: "",
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
      { key: "eyebrow", label: "Rótulo (eyebrow)", type: "text", placeholder: "Cardápio", group: "Rótulo" },
      EYEBROW_COLOR,
      { key: "title", label: "Título", type: "text", placeholder: "Explore nosso Cardápio", group: "Título" },
      TITLE_COLOR,
      { key: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Mais de 100 opções...", group: "Subtítulo" },
      TEXT_COLOR("Subtítulo"),
      // Filtros
      { key: "filterActiveBgColor", label: "Cor do filtro ativo", type: "color", placeholder: "Automático", category: "appearance", group: "Filtros" },
      { key: "filterActiveTextColor", label: "Cor do texto do filtro ativo", type: "color", placeholder: "Automático", category: "appearance", group: "Filtros" },
      // Cards
      { key: "cardBgColor", label: "Cor de fundo dos cards", type: "color", placeholder: "Automático", category: "appearance", group: "Cards" },
      // Botão do cardápio
      { key: "pdfButtonText", label: "Texto do botão", type: "text", placeholder: "Baixar cardápio", group: "Botão do cardápio" },
      { key: "pdfBtnBgColor", label: "Cor de fundo", type: "color", placeholder: "Automático", category: "appearance", group: "Botão do cardápio" },
      { key: "pdfBtnTextColor", label: "Cor do texto", type: "color", placeholder: "Automático", category: "appearance", group: "Botão do cardápio" },
      { key: "pdfBtnBorderColor", label: "Cor da borda", type: "color", placeholder: "Automático", category: "appearance", group: "Botão do cardápio" },
      // Seção
      ...SECTION_GROUP([
        LAYOUT_VARIANT([
          { value: "grid", label: "Grade padrão (4 col.)" },
          { value: "spacious", label: "Confortável (3 col.)" },
          { value: "compact", label: "Compacto (5 col.)" },
        ]),
        ...BTN_COLORS("Seção"),
      ]),
    ],
    defaultProps: {
      layout_variant: "grid",
      eyebrow: "Cardápio",
      title: "Explore nosso Cardápio",
      subtitle: "Mais de 100 opções preparadas com carinho para você.",
      pdfButtonText: "Baixar cardápio",
      eyebrowColor: "",
      pdfBtnBgColor: "",
      pdfBtnTextColor: "",
      pdfBtnBorderColor: "",
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
      { key: "eyebrow", label: "Rótulo (eyebrow)", type: "text", placeholder: "A nossa história", group: "Rótulo" },
      EYEBROW_COLOR,
      { key: "title", label: "Título", type: "text", placeholder: "Nossa História", group: "Título" },
      TITLE_COLOR,
      { key: "content", label: "Texto", type: "richtext", group: "Texto" },
      TEXT_COLOR("Texto"),
      // Botão
      { key: "buttonText", label: "Texto", type: "text", placeholder: "Saiba mais", group: "Botão" },
      { key: "buttonLink", label: "Link", type: "url", placeholder: "https://...", group: "Botão" },
      ...BTN_COLORS("Botão"),
      // Imagem
      { key: "image", label: "Imagem", type: "image", group: "Imagem" },
      // Selo
      { key: "decalNumber", label: "Número", type: "text", placeholder: "10", group: "Selo" },
      { key: "decalLabel", label: "Sub", type: "text", placeholder: "Anos", group: "Selo" },
      { key: "decalText", label: "Texto", type: "text", placeholder: "De Excelência", group: "Selo" },
      { key: "decalBgColor", label: "Cor de fundo do número", type: "color", placeholder: "Automático", category: "appearance", group: "Selo" },
      { key: "decalNumberColor", label: "Cor do número", type: "color", placeholder: "Automático", category: "appearance", group: "Selo" },
      { key: "decalTextColor", label: "Cor do texto (sub/texto)", type: "color", placeholder: "Automático", category: "appearance", group: "Selo" },
      // Seção
      ...SECTION_GROUP([
        LAYOUT_VARIANT([
          { value: "image_right", label: "Imagem à direita (Padrão)" },
          { value: "image_left", label: "Imagem à esquerda" },
          { value: "stacked", label: "Empilhado (centralizado)" },
        ]),
      ]),
    ],
    defaultProps: {
      layout_variant: "image_right",
      eyebrow: "A nossa história",
      title: "Nossa História",
      content: "<p>Conte sua história aqui...</p>",
      buttonText: "Saiba mais",
      buttonLink: "#",
      image: "",
      decalNumber: "10",
      decalLabel: "Anos",
      decalText: "De Excelência",
      eyebrowColor: "",
      decalBgColor: "",
      decalNumberColor: "",
      decalTextColor: "",
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
      { key: "eyebrow", label: "Rótulo (eyebrow)", type: "text", placeholder: "Expansão", group: "Rótulo" },
      EYEBROW_COLOR,
      { key: "title", label: "Título", type: "text", placeholder: "Seja um Franqueado", group: "Título" },
      TITLE_COLOR,
      { key: "description", label: "Descrição", type: "richtext", group: "Descrição" },
      TEXT_COLOR("Descrição"),
      // Estatísticas
      {
        key: "stats",
        label: "Estatísticas",
        type: "array",
        group: "Estatísticas",
        itemFields: [
          { key: "value", label: "Valor", type: "text", placeholder: "700+" },
          { key: "label", label: "Label", type: "text", placeholder: "Unidades" },
        ],
      },
      { key: "statValueColor", label: "Cor do valor", type: "color", placeholder: "Automático", category: "appearance", group: "Estatísticas" },
      { key: "statLabelColor", label: "Cor do label", type: "color", placeholder: "Automático", category: "appearance", group: "Estatísticas" },
      // Botão
      { key: "buttonText", label: "Texto", type: "text", placeholder: "Quero Abrir uma Unidade", group: "Botão" },
      ...BTN_COLORS("Botão"),
      // Imagem
      { key: "image", label: "Imagem do mapa", type: "image", group: "Imagem" },
      // Card
      { key: "cardBgColor", label: "Cor de fundo do card", type: "color", placeholder: "Automático", category: "appearance", group: "Card" },
      { key: "cardBorderColor", label: "Cor da borda do card", type: "color", placeholder: "Automático", category: "appearance", group: "Card" },
      // Seção
      ...SECTION_GROUP([
        LAYOUT_VARIANT([
          { value: "split", label: "Dividido com imagem (Padrão)" },
          { value: "image_left", label: "Imagem à esquerda" },
          { value: "centered", label: "Centralizado" },
        ]),
      ]),
    ],
    defaultProps: {
      layout_variant: "split",
      eyebrow: "Expansão",
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
      eyebrowColor: "",
      statValueColor: "",
      statLabelColor: "",
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
      { key: "title", label: "Título", type: "text", placeholder: "Galeria", group: "Título" },
      TITLE_COLOR,
      {
        key: "images",
        label: "Imagens",
        type: "array",
        group: "Imagens",
        itemFields: [
          { key: "url", label: "Imagem", type: "image" },
          { key: "caption", label: "Legenda", type: "text" },
        ],
      },
      ...SECTION_GROUP([
        LAYOUT_VARIANT([
          { value: "grid", label: "Grade quadrada (Padrão)" },
          { value: "wide", label: "Destaque (2 col. largas)" },
          { value: "compact", label: "Compacto (mosaico)" },
        ]),
      ]),
    ],
    defaultProps: {
      title: "Galeria",
      layout_variant: "grid",
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
      { key: "title", label: "Título", type: "text", placeholder: "Faça seu pedido agora!", group: "Título" },
      TITLE_COLOR,
      { key: "description", label: "Descrição", type: "textarea", group: "Descrição" },
      TEXT_COLOR("Descrição"),
      // Botão
      { key: "buttonText", label: "Texto", type: "text", placeholder: "Pedir Agora", group: "Botão" },
      { key: "buttonLink", label: "Link", type: "url", group: "Botão" },
      ...BTN_COLORS("Botão"),
      // Seção
      ...SECTION_GROUP([
        LAYOUT_VARIANT([
          { value: "card", label: "Cartão centralizado (Padrão)" },
          { value: "split", label: "Texto + botão lado a lado" },
          { value: "band", label: "Faixa cheia" },
        ]),
      ]),
    ],
    defaultProps: {
      title: "Faça seu pedido agora!",
      layout_variant: "card",
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
      { key: "title", label: "Título", type: "text", placeholder: "Título", group: "Título" },
      TITLE_COLOR,
      { key: "content", label: "Texto", type: "richtext", group: "Texto" },
      TEXT_COLOR("Texto"),
      ...SECTION_GROUP(),
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
        group: "Divisor",
        options: [
          { value: "scroll_arrow", label: "Seta de Scroll" },
          { value: "line", label: "Linha" },
          { value: "space", label: "Espaço" },
          { value: "wave", label: "Onda" },
        ],
      },
      { key: "backgroundColor", label: "Cor de fundo (topo)", type: "color", placeholder: "Ex: #FFFFFF", category: "appearance", group: "Divisor" },
      { key: "fillColor", label: "Cor de preenchimento (base/onda)", type: "color", placeholder: "Ex: #000000", category: "appearance", group: "Divisor" },
    ],
    defaultProps: {
      style: "space",
      backgroundColor: "",
      fillColor: "",
    },
  },

  container: {
    type: "container",
    label: "Container (Livre)",
    description: "Monte um layout livre com linhas, colunas e blocos",
    icon: Columns3,
    fields: [
      ...SECTION_GROUP(),
    ],
    defaultProps: {
      rows: [],
      ...COMMON_APPEARANCE_DEFAULTS,
    },
  },

  footer: {
    type: "footer",
    label: "Rodapé",
    description: "Rodapé do site com links, redes sociais e informações da empresa.",
    icon: PanelBottomOpen,
    fields: [
      // Marca
      { key: "siteName", label: "Nome do site", type: "text", placeholder: "Meu Site", group: "Marca" },
      { key: "description", label: "Descrição", type: "textarea", placeholder: "Oferecemos os melhores produtos...", group: "Marca" },
      // Empresa
      { key: "companyName", label: "Nome da empresa", type: "text", placeholder: "Empresa Exemplo Ltda", group: "Empresa" },
      { key: "cnpj", label: "CNPJ", type: "text", placeholder: "00.000.000/0001-00", group: "Empresa" },
      // Coluna: Navegação
      { key: "navTitle", label: "Título da coluna", type: "text", placeholder: "Navegue", group: "Coluna: Navegação" },
      {
        key: "navLinks",
        label: "Links de navegação",
        type: "array",
        group: "Coluna: Navegação",
        itemFields: [
          { key: "label", label: "Texto", type: "text" },
          { key: "url", label: "URL", type: "text" },
        ],
      },
      // Coluna: Institucional
      { key: "institutionalTitle", label: "Título da coluna", type: "text", placeholder: "Institucional", group: "Coluna: Institucional" },
      { key: "partnerLabel", label: "Texto do botão de parceria", type: "text", placeholder: "Seja parceiro", group: "Coluna: Institucional" },
      // Coluna: Ajuda
      { key: "helpTitle", label: "Título da coluna", type: "text", placeholder: "Ajuda", group: "Coluna: Ajuda" },
      { key: "whatsapp", label: "WhatsApp (telefone)", type: "text", placeholder: "(11) 99999-9999", group: "Coluna: Ajuda" },
      { key: "email", label: "E-mail de contato", type: "text", placeholder: "contato@site.com", group: "Coluna: Ajuda" },
      // Redes sociais (deixe vazio para usar as configurações globais)
      { key: "instagram", label: "Instagram (URL)", type: "url", placeholder: "https://instagram.com/...", group: "Redes sociais" },
      { key: "facebook", label: "Facebook (URL)", type: "url", placeholder: "https://facebook.com/...", group: "Redes sociais" },
      { key: "tiktok", label: "TikTok (URL)", type: "url", placeholder: "https://tiktok.com/@...", group: "Redes sociais" },
      // Seção (cores aplicam a todas as colunas)
      ...SECTION_GROUP([
        { key: "titleColor", label: "Cor dos títulos", type: "color", placeholder: "Automático", category: "appearance", group: "Seção" },
        { key: "subtitleColor", label: "Cor dos textos", type: "color", placeholder: "Automático", category: "appearance", group: "Seção" },
      ]),
    ],
    defaultProps: {
      siteName: "Meu Site",
      description: "Oferecemos os melhores produtos e serviços com qualidade e dedicação.",
      companyName: "Empresa Exemplo Ltda.",
      cnpj: "",
      navTitle: "Navegue",
      navLinks: [
        { label: "Início", url: "#hero-section" },
        { label: "Destaques", url: "#destaques" },
        { label: "Sobre", url: "#sobre" },
        { label: "Produtos", url: "#cardapio" },
      ],
      institutionalTitle: "Institucional",
      partnerLabel: "Seja parceiro",
      helpTitle: "Ajuda",
      whatsapp: "",
      email: "",
      instagram: "",
      facebook: "",
      tiktok: "",
      ...COMMON_APPEARANCE_DEFAULTS,
      section_bg_type: "#FFFFFF",
    },
    maxInstances: 1,
  },
};


/** Lista ordenada para exibir na biblioteca */
export const sectionTypes = Object.values(sectionRegistry);
