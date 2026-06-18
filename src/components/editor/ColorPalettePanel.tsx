import { useState, useMemo } from "react";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";

export interface DesignToken {
  id: string;
  name: string;
  hex: string;
}

export function ColorPalettePanel() {
  const { theme, updateTheme } = useEditorStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHex, setEditHex] = useState("");

  const tokens: DesignToken[] = useMemo(() => {
    try {
      const colorsStr = theme["theme_custom_colors"];
      return colorsStr ? JSON.parse(colorsStr) : [];
    } catch (e) {
      return [];
    }
  }, [theme]);

  const saveTokens = (newTokens: DesignToken[]) => {
    updateTheme("theme_custom_colors", JSON.stringify(newTokens));
  };

  const handleAddToken = () => {
    const newToken: DesignToken = {
      id: `color_${Date.now().toString(36)}`,
      name: `Nova Cor ${tokens.length + 1}`,
      hex: "#000000",
    };
    saveTokens([...tokens, newToken]);
    startEditing(newToken);
  };

  const handleRemoveToken = (id: string) => {
    if (window.confirm("Deseja realmente remover esta cor da paleta global? Isso pode afetar componentes que a utilizam.")) {
      saveTokens(tokens.filter((t) => t.id !== id));
    }
  };

  const startEditing = (token: DesignToken) => {
    setEditingId(token.id);
    setEditName(token.name);
    setEditHex(token.hex);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditHex("");
  };

  const saveEditing = () => {
    if (!editingId) return;
    const newTokens = tokens.map((t) =>
      t.id === editingId ? { ...t, name: editName, hex: editHex } : t
    );
    saveTokens(newTokens);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div>
          <h2 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Paleta Global</h2>
          <p className="text-[10px] text-zinc-400 font-medium mt-1 leading-relaxed max-w-[200px]">
            Design tokens para todo o site.
          </p>
        </div>
        <button
          onClick={handleAddToken}
          className="w-8 h-8 flex items-center justify-center bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all shadow-md shadow-zinc-900/20"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        {tokens.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xs text-zinc-400">Nenhuma cor cadastrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                className={cn(
                  "p-3 rounded-2xl border transition-all duration-200",
                  editingId === token.id ? "border-zinc-900 shadow-lg" : "border-zinc-100 hover:border-zinc-300 bg-zinc-50/50"
                )}
              >
                {editingId === token.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full shadow-inner border border-zinc-200 shrink-0 overflow-hidden relative cursor-pointer"
                        style={{ backgroundColor: editHex }}
                      >
                         <input
                          type="color"
                          value={editHex}
                          onChange={(e) => setEditHex(e.target.value)}
                          className="absolute inset-0 w-12 h-12 -translate-x-2 -translate-y-2 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-xs font-bold text-zinc-900 bg-white border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-zinc-900"
                          placeholder="Nome da cor"
                        />
                        <input
                          type="text"
                          value={editHex}
                          onChange={(e) => setEditHex(e.target.value)}
                          className="w-full text-[10px] uppercase font-mono text-zinc-500 bg-white border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-zinc-900"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                      <button onClick={cancelEditing} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                      <button onClick={saveEditing} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors">
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full shadow-sm border border-zinc-200"
                        style={{ backgroundColor: token.hex }}
                      />
                      <div>
                        <p className="text-[11px] font-bold text-zinc-900 leading-none mb-1">{token.name}</p>
                        <p className="text-[9px] uppercase font-mono text-zinc-400 leading-none">{token.hex}</p>
                      </div>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(token)}
                        className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveToken(token.id)}
                        className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
