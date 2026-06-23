"use client";

import { useState } from "react";
import { getSectionStyles } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editorStore";
import { BlockRenderer } from "@/components/editor/blocks/BlockRenderer";
import { blockRegistry, blockTypes } from "@/components/editor/blocks/blockRegistry";
import {
  ROW_LAYOUTS,
  widthToFr,
  genId,
  addRow,
  removeRow,
  moveRow,
  addColumn,
  removeColumn,
  addBlock,
  removeBlock,
  moveBlock,
  type ContainerRow,
  type ContainerColumn,
  type ContainerBlock,
} from "@/components/editor/blocks/containerModel";
import { Plus, Trash2, ChevronUp, ChevronDown, Columns3, X, Bookmark } from "lucide-react";
import { SaveBlockDialog } from "@/components/editor/SaveBlockDialog";
import { createSavedBlock, fetchSavedBlocks, type SavedBlock } from "@/utils/savedBlocks";

interface ContainerProps {
  settings?: Record<string, string>;
  props?: Record<string, unknown>;
  isEditor?: boolean;
  sectionId?: string;
}

export function Container({ props: editorProps, isEditor, sectionId }: ContainerProps) {
  const styles = getSectionStyles(editorProps || {});
  const rows = (editorProps?.rows as ContainerRow[]) || [];

  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);
  const mutateRows = useEditorStore((s) => s.mutateContainerRows);
  const savedBlocks = useEditorStore((s) => s.savedBlocks);
  const setSavedBlocks = useEditorStore((s) => s.setSavedBlocks);

  const [blockMenu, setBlockMenu] = useState<{ rowId: string; colId: string } | null>(null);
  const [rowMenu, setRowMenu] = useState(false);
  const [saveBlock, setSaveBlock] = useState<ContainerBlock | null>(null);

  const savedAtomic = savedBlocks.filter((b) => b.kind === "block");
  const handleSaveAtomic = async (name: string) => {
    if (!saveBlock) return;
    const { error } = await createSavedBlock({ name, kind: "block", type: saveBlock.type, props: saveBlock.props });
    if (!error) setSavedBlocks(await fetchSavedBlocks());
  };

  const editing = !!isEditor && !!sectionId && selectedSectionId === sectionId;

  // No público, um container vazio não renderiza nada.
  if (!isEditor && rows.length === 0) return null;

  // ---- Ações (só no modo edição) ----
  const sid = sectionId || "";
  const doAddRow = (widths: string[]) => { mutateRows(sid, (r) => addRow(r, widths)); setRowMenu(false); };
  const doRemoveRow = (rowId: string) => mutateRows(sid, (r) => removeRow(r, rowId));
  const doMoveRow = (rowId: string, dir: "up" | "down") => mutateRows(sid, (r) => moveRow(r, rowId, dir));
  const doAddColumn = (rowId: string) => mutateRows(sid, (r) => addColumn(r, rowId));
  const doRemoveColumn = (rowId: string, colId: string) => mutateRows(sid, (r) => removeColumn(r, rowId, colId));
  const doAddBlock = (rowId: string, colId: string, type: string) => {
    const block: ContainerBlock = { id: genId("blk"), type, props: JSON.parse(JSON.stringify(blockRegistry[type].defaultProps)) };
    mutateRows(sid, (r) => addBlock(r, rowId, colId, block));
    setBlockMenu(null);
    selectNode(block.id);
  };
  const doAddSavedBlock = (rowId: string, colId: string, saved: SavedBlock) => {
    const block: ContainerBlock = { id: genId("blk"), type: saved.type, props: JSON.parse(JSON.stringify(saved.props)) };
    mutateRows(sid, (r) => addBlock(r, rowId, colId, block));
    setBlockMenu(null);
    selectNode(block.id);
  };
  const doRemoveBlock = (blockId: string) => {
    mutateRows(sid, (r) => removeBlock(r, blockId));
    if (selectedNodeId === blockId) selectNode(null);
  };
  const doMoveBlock = (blockId: string, dir: "up" | "down") => mutateRows(sid, (r) => moveBlock(r, blockId, dir));

  // ---- Render de um bloco ----
  const renderBlock = (block: ContainerBlock, isFirst: boolean, isLast: boolean) => {
    if (!editing) return <BlockRenderer key={block.id} block={block} />;
    const selected = selectedNodeId === block.id;
    return (
      <div
        key={block.id}
        onClick={(e) => { e.stopPropagation(); selectNode(block.id); }}
        className={cn(
          "relative group/blk rounded-lg cursor-pointer transition-all",
          selected ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-white" : "hover:ring-2 hover:ring-zinc-400/50"
        )}
      >
        <div className={cn("absolute -top-3 right-1 z-30 flex items-center gap-0.5 p-0.5 bg-zinc-900 rounded-lg shadow-lg", selected ? "flex" : "hidden group-hover/blk:flex")}>
          <button onClick={(e) => { e.stopPropagation(); doMoveBlock(block.id, "up"); }} disabled={isFirst} className="p-1 rounded text-white/80 hover:bg-white/15 disabled:opacity-30" title="Mover para cima"><ChevronUp className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); doMoveBlock(block.id, "down"); }} disabled={isLast} className="p-1 rounded text-white/80 hover:bg-white/15 disabled:opacity-30" title="Mover para baixo"><ChevronDown className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); setSaveBlock(block); }} className="p-1 rounded text-white/80 hover:bg-white/15" title="Salvar como bloco"><Bookmark className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); doRemoveBlock(block.id); }} className="p-1 rounded text-white/80 hover:bg-red-500" title="Remover bloco"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
        <BlockRenderer block={block} />
      </div>
    );
  };

  // ---- Render de uma coluna ----
  const renderColumn = (row: ContainerRow, col: ContainerColumn) => (
    <div key={col.id} className="min-w-0 space-y-4">
      {col.blocks.map((b, i) => renderBlock(b, i === 0, i === col.blocks.length - 1))}

      {editing && (
        <div className="relative">
          {col.blocks.length === 0 && blockMenu?.colId !== col.id && (
            <div className="text-center text-[11px] text-zinc-400 font-medium py-3">Coluna vazia</div>
          )}
          {blockMenu?.colId === col.id ? (
            <div className="rounded-xl border border-zinc-200 bg-white shadow-lg p-2 grid grid-cols-3 gap-1.5">
              {blockTypes.map((bt) => {
                const Icon = bt.icon;
                return (
                  <button
                    key={bt.type}
                    onClick={(e) => { e.stopPropagation(); doAddBlock(row.id, col.id, bt.type); }}
                    className="flex flex-col items-center gap-1 px-1 py-2 rounded-lg text-zinc-600 hover:bg-zinc-900 hover:text-white transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] font-bold">{bt.label}</span>
                  </button>
                );
              })}
              {savedAtomic.length > 0 && (
                <div className="col-span-3 border-t border-zinc-100 pt-1.5 mt-0.5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400 px-1 mb-1">Meus blocos</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {savedAtomic.map((sb) => {
                      const Icon = blockRegistry[sb.type]?.icon ?? Plus;
                      return (
                        <button
                          key={sb.id}
                          onClick={(e) => { e.stopPropagation(); doAddSavedBlock(row.id, col.id, sb); }}
                          title={sb.name}
                          className="flex flex-col items-center gap-1 px-1 py-2 rounded-lg text-zinc-600 hover:bg-zinc-900 hover:text-white transition-colors"
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[9px] font-bold truncate max-w-full">{sb.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); setBlockMenu(null); }} className="col-span-3 text-[10px] font-bold text-zinc-400 hover:text-zinc-700 py-1">Cancelar</button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setBlockMenu({ rowId: row.id, colId: col.id }); }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-zinc-300 text-zinc-400 text-[11px] font-bold uppercase tracking-wider hover:border-zinc-500 hover:text-zinc-600 hover:bg-zinc-50 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Bloco
            </button>
          )}
          {editing && col.blocks.length === 0 && row.columns.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); doRemoveColumn(row.id, col.id); }}
              className="mt-1.5 w-full text-[10px] font-bold text-zinc-300 hover:text-red-500 transition-colors"
            >
              Remover coluna
            </button>
          )}
        </div>
      )}
    </div>
  );

  // ---- Render de uma linha ----
  const renderRow = (row: ContainerRow, i: number) => (
    <div key={row.id} className={cn("relative", editing && "group/row rounded-xl hover:bg-zinc-50/60 transition-colors")}>
      {editing && (
        <div className="absolute -top-3 left-1 z-20 hidden group-hover/row:flex items-center gap-0.5 p-0.5 bg-white border border-zinc-200 rounded-lg shadow-md">
          <button onClick={(e) => { e.stopPropagation(); doMoveRow(row.id, "up"); }} disabled={i === 0} className="p-1 rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30" title="Mover linha p/ cima"><ChevronUp className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); doMoveRow(row.id, "down"); }} disabled={i === rows.length - 1} className="p-1 rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30" title="Mover linha p/ baixo"><ChevronDown className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); doAddColumn(row.id); }} disabled={row.columns.length >= 4} className="p-1 rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30" title="Adicionar coluna"><Columns3 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); doRemoveRow(row.id); }} className="p-1 rounded text-zinc-500 hover:bg-red-500 hover:text-white" title="Remover linha"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )}
      <div
        className="flex flex-col md:grid gap-4 md:gap-6"
        style={{ gridTemplateColumns: row.columns.map((c) => `${widthToFr(c.width)}fr`).join(" ") }}
      >
        {row.columns.map((col) => renderColumn(row, col))}
      </div>
    </div>
  );

  return (
    <section className={cn("relative", styles.container)} style={styles.style}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="space-y-6">
          {rows.map((row, i) => renderRow(row, i))}
        </div>

        {/* Placeholder quando vazio e não selecionado (editor) */}
        {isEditor && !editing && rows.length === 0 && (
          <p className="text-center text-sm text-zinc-300 py-8">Container vazio — clique para editar</p>
        )}

        {/* Estado vazio + adicionar linha (somente edição) */}
        {editing && (
          <div className="mt-6">
            {rows.length === 0 && !rowMenu && (
              <p className="text-center text-sm text-zinc-400 mb-4">Container vazio. Adicione uma linha para começar.</p>
            )}
            {rowMenu ? (
              <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg p-3">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500">Escolha o layout da linha</span>
                  <button onClick={(e) => { e.stopPropagation(); setRowMenu(false); }} className="text-zinc-400 hover:text-zinc-700"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ROW_LAYOUTS.map((l) => (
                    <button
                      key={l.id}
                      onClick={(e) => { e.stopPropagation(); doAddRow(l.widths); }}
                      className="group/lyt flex flex-col gap-1.5 p-2 rounded-xl border border-zinc-200 hover:border-zinc-900 hover:shadow-md transition-all"
                    >
                      <div className="flex gap-1 h-7">
                        {l.widths.map((w, idx) => (
                          <div key={idx} className="rounded bg-zinc-200 group-hover/lyt:bg-zinc-300" style={{ flexGrow: Number(widthToFr(w)) }} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-600">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setRowMenu(true); }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-zinc-300 text-zinc-400 text-xs font-bold uppercase tracking-wider hover:border-zinc-500 hover:text-zinc-600 hover:bg-zinc-50 transition-all"
              >
                <Plus className="w-4 h-4" /> Adicionar linha
              </button>
            )}
          </div>
        )}
      </div>

      <SaveBlockDialog
        open={!!saveBlock}
        defaultName={saveBlock ? blockRegistry[saveBlock.type]?.label ?? "Bloco" : ""}
        onSave={handleSaveAtomic}
        onClose={() => setSaveBlock(null)}
      />
    </section>
  );
}

export default Container;
