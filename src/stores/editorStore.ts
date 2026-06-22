import { create } from "zustand";
import { sectionRegistry } from "@/components/editor/sections/registry";

// ---- Types ----

export interface SectionProps {
  [key: string]: unknown;
}

export interface PageSection {
  id: string;
  type: string;
  visible: boolean;
  props: SectionProps;
}

export interface HistoryState {
  sections: PageSection[];
  theme: Record<string, string>;
}

export type CanvasMode = "edit" | "preview";
export type Viewport = "desktop" | "tablet" | "mobile";

export interface SelectedBlock {
  sectionId: string;
  fieldKey: string;
  itemIndex?: number;
}

export interface DragState {
  kind: "new" | "reorder";
  sectionType?: string;
  sectionId?: string;
}

export interface EditorState {
  // Data
  sections: PageSection[];
  selectedSectionId: string | null;
  selectedBlock: SelectedBlock | null;
  isDirty: boolean;
  isThemeDirty: boolean;
  isSaving: boolean;
  theme: Record<string, string>;

  // UI / Canvas
  canvasMode: CanvasMode;
  viewport: Viewport;
  dragState: DragState | null;

  // History
  past: HistoryState[];
  future: HistoryState[];

  // Actions
  setSections: (sections: PageSection[]) => void;
  reorderSections: (sections: PageSection[]) => void;
  selectSection: (id: string | null) => void;
  selectBlock: (block: SelectedBlock | null) => void;
  addSection: (type: string, afterId?: string) => void;
  addSectionAtIndex: (type: string, index: number) => void;
  removeSection: (id: string) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  toggleVisibility: (id: string) => void;
  updateSectionProps: (id: string, props: Partial<SectionProps>) => void;
  duplicateSection: (id: string) => void;
  setDirty: (dirty: boolean) => void;
  setThemeDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setTheme: (theme: Record<string, string>) => void;
  updateTheme: (key: string, value: string) => void;
  resetTheme: () => void;
  reset: () => void;

  // UI Actions
  setCanvasMode: (mode: CanvasMode) => void;
  setViewport: (viewport: Viewport) => void;
  setDragState: (drag: DragState | null) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  /**
   * Tira um snapshot do estado atual para o histórico (chamar ANTES de mutar).
   * Passe um `coalesceKey` para agrupar edições contínuas do mesmo alvo (ex:
   * digitar num campo) num único snapshot, evitando que o undo desfaça letra a letra.
   */
  saveHistory: (coalesceKey?: string) => void;
  clearHistory: () => void;
}

// ---- Helpers ----

function generateId(): string {
  return `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// Estado de agrupamento (coalescing) do histórico — fora do store por ser
// puramente interno e não-reativo.
let lastCoalesceKey: string | null = null;
let lastCoalesceAt = 0;
const COALESCE_WINDOW_MS = 500;

function getDefaultPropsForType(type: string): SectionProps {
  const entry = sectionRegistry[type];
  return entry ? JSON.parse(JSON.stringify(entry.defaultProps)) : {};
}

// ---- Store ----

export const useEditorStore = create<EditorState>((set, get) => ({
  sections: [],
  selectedSectionId: null,
  selectedBlock: null,
  isDirty: false,
  isThemeDirty: false,
  isSaving: false,
  theme: {},

  canvasMode: "edit",
  viewport: "desktop",
  dragState: null,

  past: [],
  future: [],

  saveHistory: (coalesceKey?: string) => {
    const now = Date.now();
    // Edição contínua do mesmo alvo dentro da janela: não empilha novo snapshot,
    // preservando o estado anterior à rajada (1 undo desfaz a edição inteira).
    if (coalesceKey && coalesceKey === lastCoalesceKey && now - lastCoalesceAt < COALESCE_WINDOW_MS) {
      lastCoalesceAt = now;
      set({ future: [] });
      return;
    }
    lastCoalesceKey = coalesceKey ?? null;
    lastCoalesceAt = now;
    const { sections, theme, past } = get();
    const stateCopy = {
      sections: JSON.parse(JSON.stringify(sections)),
      theme: JSON.parse(JSON.stringify(theme))
    };
    const newPast = [...past, stateCopy].slice(-50); // limit to 50 items
    set({ past: newPast, future: [] });
  },

  clearHistory: () => {
    lastCoalesceKey = null;
    set({ past: [], future: [] });
  },

  undo: () => {
    lastCoalesceKey = null;
    const { past, sections, theme, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      past: newPast,
      future: [{ sections: JSON.parse(JSON.stringify(sections)), theme: JSON.parse(JSON.stringify(theme)) }, ...future],
      sections: previous.sections,
      theme: previous.theme,
      isDirty: true
    });
  },

  redo: () => {
    lastCoalesceKey = null;
    const { past, sections, theme, future } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, { sections: JSON.parse(JSON.stringify(sections)), theme: JSON.parse(JSON.stringify(theme)) }],
      future: newFuture,
      sections: next.sections,
      theme: next.theme,
      isDirty: true
    });
  },

  setSections: (sections) => set({ sections }),

  reorderSections: (newSections: PageSection[]) => {
    get().saveHistory();
    set({ sections: newSections, isDirty: true });
  },

  selectSection: (id) => set({ selectedSectionId: id, selectedBlock: null }),

  selectBlock: (block) =>
    set(block ? { selectedBlock: block, selectedSectionId: block.sectionId } : { selectedBlock: null }),

  addSectionAtIndex: (type, index) => {
    get().saveHistory();
    const { sections } = get();
    const newSection: PageSection = {
      id: generateId(),
      type,
      visible: true,
      props: getDefaultPropsForType(type),
    };
    const clamped = Math.max(0, Math.min(index, sections.length));
    const newSections = [...sections];
    newSections.splice(clamped, 0, newSection);
    set({ sections: newSections, isDirty: true, selectedSectionId: newSection.id, selectedBlock: null });
  },

  addSection: (type, afterId) => {
    get().saveHistory();
    const { sections } = get();
    const newSection: PageSection = {
      id: generateId(),
      type,
      visible: true,
      props: getDefaultPropsForType(type),
    };

    if (afterId) {
      const idx = sections.findIndex((s) => s.id === afterId);
      const newSections = [...sections];
      newSections.splice(idx + 1, 0, newSection);
      set({ sections: newSections, isDirty: true, selectedSectionId: newSection.id });
    } else {
      set({ sections: [...sections, newSection], isDirty: true, selectedSectionId: newSection.id });
    }
  },

  removeSection: (id) => {
    get().saveHistory();
    const { sections, selectedSectionId, selectedBlock } = get();
    set({
      sections: sections.filter((s) => s.id !== id),
      selectedSectionId: selectedSectionId === id ? null : selectedSectionId,
      selectedBlock: selectedBlock?.sectionId === id ? null : selectedBlock,
      isDirty: true,
    });
  },

  moveSection: (fromIndex, toIndex) => {
    get().saveHistory();
    const { sections } = get();
    if (fromIndex === toIndex) return;
    const newSections = [...sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);
    set({ sections: newSections, isDirty: true });
  },

  toggleVisibility: (id) => {
    get().saveHistory();
    const { sections } = get();
    set({
      sections: sections.map((s) =>
        s.id === id ? { ...s, visible: !s.visible } : s
      ),
      isDirty: true,
    });
  },

  updateSectionProps: (id, props) => {
    // Agrupa edições contínuas do(s) mesmo(s) campo(s) da mesma seção num só snapshot.
    get().saveHistory(`props:${id}:${Object.keys(props).join(",")}`);
    const { sections } = get();
    set({
      sections: sections.map((s) =>
        s.id === id ? { ...s, props: { ...s.props, ...props } } : s
      ),
      isDirty: true,
    });
  },

  duplicateSection: (id) => {
    get().saveHistory();
    const { sections } = get();
    const original = sections.find((s) => s.id === id);
    if (!original) return;
    const duplicate: PageSection = {
      ...JSON.parse(JSON.stringify(original)),
      id: generateId(),
    };
    const idx = sections.findIndex((s) => s.id === id);
    const newSections = [...sections];
    newSections.splice(idx + 1, 0, duplicate);
    set({ sections: newSections, isDirty: true, selectedSectionId: duplicate.id });
  },

  setDirty: (dirty: boolean) => set({ isDirty: dirty }),
  setThemeDirty: (dirty: boolean) => set({ isThemeDirty: dirty }),
  setSaving: (saving) => set({ isSaving: saving }),

  setTheme: (theme) => set({ theme, isDirty: false, isThemeDirty: false }),

  updateTheme: (key, value) => {
    get().saveHistory(`theme:${key}`);
    const { theme } = get();
    set({ theme: { ...theme, [key]: value }, isDirty: true, isThemeDirty: true });
  },

  resetTheme: () => {
    get().saveHistory();
    const { theme } = get();
    set({
      theme: {
        ...theme,
        theme_primary_color: "#000000",
        theme_bg_color: "#FFFFFF",
        theme_tertiary_color: "#333333",
        theme_custom_colors: "[]",
      },
      isDirty: true,
      isThemeDirty: true,
    });
  },

  setCanvasMode: (mode) => set({ canvasMode: mode }),
  setViewport: (viewport) => set({ viewport }),
  setDragState: (drag) => set({ dragState: drag }),

  reset: () =>
    set({
      sections: [],
      selectedSectionId: null,
      selectedBlock: null,
      isDirty: false,
      isThemeDirty: false,
      isSaving: false,
      theme: {},
      canvasMode: "edit",
      viewport: "desktop",
      dragState: null,
      past: [],
      future: []
    }),
}));
