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

export interface EditorState {
  // Data
  sections: PageSection[];
  selectedSectionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  theme: Record<string, string>;

  // Actions
  setSections: (sections: PageSection[]) => void;
  reorderSections: (sections: PageSection[]) => void;
  selectSection: (id: string | null) => void;
  addSection: (type: string, afterId?: string) => void;
  removeSection: (id: string) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  toggleVisibility: (id: string) => void;
  updateSectionProps: (id: string, props: Partial<SectionProps>) => void;
  duplicateSection: (id: string) => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setTheme: (theme: Record<string, string>) => void;
  updateTheme: (key: string, value: string) => void;
  reset: () => void;
}

// ---- Helpers ----

function generateId(): string {
  return `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function getDefaultPropsForType(type: string): SectionProps {
  const entry = sectionRegistry[type];
  return entry ? JSON.parse(JSON.stringify(entry.defaultProps)) : {};
}

// ---- Store ----

export const useEditorStore = create<EditorState>((set, get) => ({
  sections: [],
  selectedSectionId: null,
  isDirty: false,
  isSaving: false,
  theme: {},

  setSections: (sections) => set({ sections }),

  reorderSections: (newSections: PageSection[]) => set({ sections: newSections, isDirty: true }),

  selectSection: (id) => set({ selectedSectionId: id }),

  addSection: (type, afterId) => {
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
    const { sections, selectedSectionId } = get();
    set({
      sections: sections.filter((s) => s.id !== id),
      selectedSectionId: selectedSectionId === id ? null : selectedSectionId,
      isDirty: true,
    });
  },

  moveSection: (fromIndex, toIndex) => {
    const { sections } = get();
    if (fromIndex === toIndex) return;
    const newSections = [...sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);
    set({ sections: newSections, isDirty: true });
  },

  toggleVisibility: (id) => {
    const { sections } = get();
    set({
      sections: sections.map((s) =>
        s.id === id ? { ...s, visible: !s.visible } : s
      ),
      isDirty: true,
    });
  },

  updateSectionProps: (id, props) => {
    const { sections } = get();
    set({
      sections: sections.map((s) =>
        s.id === id ? { ...s, props: { ...s.props, ...props } } : s
      ),
      isDirty: true,
    });
  },

  duplicateSection: (id) => {
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
  setSaving: (saving) => set({ isSaving: saving }),

  setTheme: (theme) => set({ theme, isDirty: false }),
  
  updateTheme: (key, value) => {
    const { theme } = get();
    set({ theme: { ...theme, [key]: value }, isDirty: true });
  },

  reset: () =>
    set({
      sections: [],
      selectedSectionId: null,
      isDirty: false,
      isSaving: false,
      theme: {},
    }),
}));
