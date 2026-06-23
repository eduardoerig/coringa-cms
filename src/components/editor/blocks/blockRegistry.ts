import type { PropField } from "../sections/registry";
import { Heading1, Type, Image as ImageIcon, MousePointerClick, Minus, MoveVertical } from "lucide-react";

export interface BlockRegistryEntry {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: PropField[];
  defaultProps: Record<string, unknown>;
}

const ALIGN_FIELD: PropField = {
  key: "align",
  label: "Alinhamento",
  type: "select",
  category: "appearance",
  options: [
    { value: "left", label: "Esquerda" },
    { value: "center", label: "Centro" },
    { value: "right", label: "Direita" },
  ],
};

export const blockRegistry: Record<string, BlockRegistryEntry> = {
  heading: {
    type: "heading",
    label: "Título",
    icon: Heading1,
    fields: [
      { key: "text", label: "Texto", type: "text", placeholder: "Seu título" },
      {
        key: "level",
        label: "Tamanho",
        type: "select",
        category: "appearance",
        options: [
          { value: "h2", label: "Grande (H2)" },
          { value: "h3", label: "Médio (H3)" },
          { value: "h4", label: "Pequeno (H4)" },
        ],
      },
      ALIGN_FIELD,
      { key: "color", label: "Cor", type: "color", placeholder: "Automático", category: "appearance" },
    ],
    defaultProps: { text: "Título", level: "h2", align: "left", color: "" },
  },

  text: {
    type: "text",
    label: "Texto",
    icon: Type,
    fields: [
      { key: "content", label: "Conteúdo", type: "richtext" },
      ALIGN_FIELD,
      { key: "color", label: "Cor", type: "color", placeholder: "Automático", category: "appearance" },
    ],
    defaultProps: { content: "<p>Escreva seu texto aqui...</p>", align: "left", color: "" },
  },

  image: {
    type: "image",
    label: "Imagem",
    icon: ImageIcon,
    fields: [
      { key: "src", label: "Imagem", type: "image" },
      { key: "alt", label: "Texto alternativo", type: "text" },
      {
        key: "rounded",
        label: "Cantos",
        type: "select",
        category: "appearance",
        options: [
          { value: "none", label: "Retos" },
          { value: "md", label: "Suaves" },
          { value: "xl", label: "Arredondados" },
          { value: "full", label: "Círculo" },
        ],
      },
    ],
    defaultProps: { src: "", alt: "", rounded: "xl" },
  },

  button: {
    type: "button",
    label: "Botão",
    icon: MousePointerClick,
    fields: [
      { key: "label", label: "Texto", type: "text", placeholder: "Clique aqui" },
      { key: "href", label: "Link", type: "url", placeholder: "https://..." },
      ALIGN_FIELD,
      { key: "bgColor", label: "Cor de fundo", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "textColor", label: "Cor do texto", type: "color", placeholder: "Automático", category: "appearance" },
    ],
    defaultProps: { label: "Clique aqui", href: "#", align: "left", bgColor: "", textColor: "" },
  },

  spacer: {
    type: "spacer",
    label: "Espaço",
    icon: MoveVertical,
    fields: [
      {
        key: "height",
        label: "Altura",
        type: "select",
        category: "appearance",
        options: [
          { value: "sm", label: "Pequeno" },
          { value: "md", label: "Médio" },
          { value: "lg", label: "Grande" },
          { value: "xl", label: "Enorme" },
        ],
      },
    ],
    defaultProps: { height: "md" },
  },

  divider: {
    type: "divider",
    label: "Divisor",
    icon: Minus,
    fields: [
      { key: "color", label: "Cor", type: "color", placeholder: "Automático", category: "appearance" },
    ],
    defaultProps: { color: "" },
  },
};

export const blockTypes = Object.values(blockRegistry);
