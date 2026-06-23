import type { PropField } from "../sections/registry";
import type { CanvasElementType } from "./canvasModel";
import { Type, Image as ImageIcon, Square, MousePointerClick, Sparkles } from "lucide-react";
import { CANVAS_ICON_OPTIONS } from "./canvasIcons";

// Registry dos elementos da Tela Livre (mesmo padrão do blockRegistry).
// `defaultSize` é o tamanho inicial em design-px ao adicionar o elemento.

export interface CanvasElementRegistryEntry {
  type: CanvasElementType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: PropField[];
  defaultProps: Record<string, unknown>;
  defaultSize: { w: number; h: number };
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

export const canvasElementRegistry: Record<CanvasElementType, CanvasElementRegistryEntry> = {
  text: {
    type: "text",
    label: "Texto",
    icon: Type,
    fields: [
      { key: "text", label: "Texto", type: "textarea" },
      { key: "fontSize", label: "Tamanho da fonte", type: "number", category: "appearance", min: 8, max: 200, step: 1, unit: "px" },
      {
        key: "fontWeight",
        label: "Peso",
        type: "select",
        category: "appearance",
        options: [
          { value: "400", label: "Regular" },
          { value: "500", label: "Médio" },
          { value: "700", label: "Negrito" },
          { value: "900", label: "Black" },
        ],
      },
      ALIGN_FIELD,
      { key: "lineHeight", label: "Entrelinha", type: "number", category: "appearance", min: 0.8, max: 3, step: 0.1 },
      { key: "color", label: "Cor", type: "color", placeholder: "Automático", category: "appearance" },
    ],
    defaultProps: { text: "Escreva aqui", fontSize: 36, fontWeight: "700", align: "left", lineHeight: 1.2, color: "" },
    defaultSize: { w: 420, h: 64 },
  },

  image: {
    type: "image",
    label: "Imagem",
    icon: ImageIcon,
    fields: [
      { key: "src", label: "Imagem", type: "image" },
      { key: "alt", label: "Texto alternativo", type: "text" },
      {
        key: "fit",
        label: "Ajuste",
        type: "select",
        category: "appearance",
        options: [
          { value: "cover", label: "Preencher (cover)" },
          { value: "contain", label: "Conter (contain)" },
        ],
      },
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
    defaultProps: { src: "", alt: "", fit: "cover", rounded: "md" },
    defaultSize: { w: 320, h: 220 },
  },

  shape: {
    type: "shape",
    label: "Forma",
    icon: Square,
    fields: [
      {
        key: "shape",
        label: "Tipo",
        type: "select",
        category: "appearance",
        options: [
          { value: "rect", label: "Retângulo" },
          { value: "ellipse", label: "Círculo / Elipse" },
          { value: "line", label: "Linha" },
        ],
      },
      { key: "fill", label: "Preenchimento", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "radius", label: "Arredondamento", type: "number", category: "appearance", min: 0, max: 400, step: 1, unit: "px" },
      { key: "strokeWidth", label: "Espessura (linha)", type: "number", category: "appearance", min: 1, max: 80, step: 1, unit: "px" },
      { key: "borderColor", label: "Cor da borda", type: "color", placeholder: "Sem borda", category: "appearance" },
      { key: "borderWidth", label: "Espessura da borda", type: "number", category: "appearance", min: 0, max: 40, step: 1, unit: "px" },
    ],
    defaultProps: { shape: "rect", fill: "", radius: 16, strokeWidth: 4, borderColor: "", borderWidth: 0 },
    defaultSize: { w: 220, h: 220 },
  },

  button: {
    type: "button",
    label: "Botão",
    icon: MousePointerClick,
    fields: [
      { key: "label", label: "Texto", type: "text", placeholder: "Clique aqui" },
      { key: "href", label: "Link", type: "url", placeholder: "https://..." },
      { key: "fontSize", label: "Tamanho da fonte", type: "number", category: "appearance", min: 8, max: 80, step: 1, unit: "px" },
      {
        key: "radius",
        label: "Cantos",
        type: "select",
        category: "appearance",
        options: [
          { value: "md", label: "Suaves" },
          { value: "xl", label: "Arredondados" },
          { value: "full", label: "Pílula" },
        ],
      },
      { key: "bgColor", label: "Cor de fundo", type: "color", placeholder: "Automático", category: "appearance" },
      { key: "textColor", label: "Cor do texto", type: "color", placeholder: "Automático", category: "appearance" },
    ],
    defaultProps: { label: "Clique aqui", href: "#", fontSize: 16, radius: "full", bgColor: "", textColor: "" },
    defaultSize: { w: 190, h: 54 },
  },

  icon: {
    type: "icon",
    label: "Ícone",
    icon: Sparkles,
    fields: [
      { key: "name", label: "Ícone", type: "select", options: CANVAS_ICON_OPTIONS },
      { key: "color", label: "Cor", type: "color", placeholder: "Automático", category: "appearance" },
    ],
    defaultProps: { name: "Star", color: "" },
    defaultSize: { w: 96, h: 96 },
  },
};

export const canvasElementTypes = Object.values(canvasElementRegistry);
