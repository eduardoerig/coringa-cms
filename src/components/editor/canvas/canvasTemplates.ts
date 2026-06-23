// Telas prontas (Tela Livre) — pontos de partida inseridos como uma seção `canvas`.
// Os ids dos elementos são regenerados na inserção (ver SectionInserter), então aqui
// podem ser placeholders.
import type { CanvasElement } from "./canvasModel";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  glyph: string;
  props: Record<string, unknown>;
}

const DW = 1200;

// Helper: completa os campos padrão (id/rotation/opacity) de um elemento.
function el(
  e: Partial<CanvasElement> & Pick<CanvasElement, "type" | "x" | "y" | "w" | "h" | "props">
): CanvasElement {
  return { id: "tpl", rotation: 0, opacity: 1, ...e };
}

export const canvasTemplates: CanvasTemplate[] = [
  {
    id: "canvas-hero",
    name: "Hero centralizado",
    description: "Título grande, subtítulo e botão, tudo centralizado.",
    glyph: "🎯",
    props: {
      designWidth: DW, height: 520, fullWidth: "", bgColor: "", bgImage: "", grid: "",
      elements: [
        el({ type: "text", x: 200, y: 150, w: 800, h: 96, props: { text: "Seu título de impacto", fontSize: 56, fontWeight: "900", align: "center", lineHeight: 1.1, color: "" } }),
        el({ type: "text", x: 260, y: 262, w: 680, h: 60, props: { text: "Uma frase curta que explica seu produto ou serviço.", fontSize: 22, fontWeight: "400", align: "center", lineHeight: 1.3, color: "" } }),
        el({ type: "button", x: 490, y: 350, w: 220, h: 56, props: { label: "Começar agora", href: "#", fontSize: 16, radius: "full", bgColor: "", textColor: "" } }),
      ],
    },
  },
  {
    id: "canvas-banner",
    name: "Faixa promocional",
    description: "Mensagem à esquerda e botão à direita, formato faixa.",
    glyph: "📣",
    props: {
      designWidth: DW, height: 320, fullWidth: "1", bgColor: "", bgImage: "", grid: "",
      elements: [
        el({ type: "shape", x: 920, y: 30, w: 240, h: 240, opacity: 0.08, props: { shape: "ellipse", fill: "", radius: 0, strokeWidth: 4, borderColor: "", borderWidth: 0 } }),
        el({ type: "text", x: 80, y: 108, w: 680, h: 72, props: { text: "Oferta por tempo limitado", fontSize: 40, fontWeight: "800", align: "left", lineHeight: 1.1, color: "" } }),
        el({ type: "text", x: 80, y: 190, w: 560, h: 44, props: { text: "Aproveite condições especiais hoje mesmo.", fontSize: 20, fontWeight: "400", align: "left", lineHeight: 1.3, color: "" } }),
        el({ type: "button", x: 860, y: 128, w: 260, h: 60, props: { label: "Quero aproveitar", href: "#", fontSize: 16, radius: "full", bgColor: "", textColor: "" } }),
      ],
    },
  },
  {
    id: "canvas-badge",
    name: "Selo de destaque",
    description: "Círculo com ícone e legenda — um selo de qualidade.",
    glyph: "🏅",
    props: {
      designWidth: DW, height: 440, fullWidth: "", bgColor: "", bgImage: "", grid: "",
      elements: [
        el({ type: "shape", x: 450, y: 50, w: 300, h: 300, props: { shape: "ellipse", fill: "", radius: 0, strokeWidth: 4, borderColor: "", borderWidth: 0 } }),
        el({ type: "icon", x: 545, y: 145, w: 110, h: 110, props: { name: "Award", color: "#FFFFFF" } }),
        el({ type: "text", x: 350, y: 372, w: 500, h: 44, props: { text: "Qualidade premium garantida", fontSize: 24, fontWeight: "700", align: "center", lineHeight: 1.2, color: "" } }),
      ],
    },
  },
  {
    id: "canvas-quote",
    name: "Citação",
    description: "Frase em destaque com autor e um traço de realce.",
    glyph: "❝",
    props: {
      designWidth: DW, height: 420, fullWidth: "", bgColor: "", bgImage: "", grid: "",
      elements: [
        el({ type: "shape", x: 560, y: 70, w: 80, h: 8, props: { shape: "line", fill: "", strokeWidth: 8, radius: 0, borderColor: "", borderWidth: 0 } }),
        el({ type: "text", x: 200, y: 120, w: 800, h: 170, props: { text: "“A melhor decisão que tomamos foi investir nisso.”", fontSize: 34, fontWeight: "500", align: "center", lineHeight: 1.35, color: "" } }),
        el({ type: "text", x: 400, y: 312, w: 400, h: 36, props: { text: "— Cliente satisfeito", fontSize: 18, fontWeight: "700", align: "center", lineHeight: 1.2, color: "" } }),
      ],
    },
  },
];
