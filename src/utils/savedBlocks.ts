import { createClient } from "@/utils/supabase/client";

// Bloco reutilizável salvo pelo usuário ("Meus blocos").
// kind "section" = uma seção inteira; kind "block" = um bloco atômico de Container.
export interface SavedBlock {
  id: string;
  name: string;
  kind: "section" | "block";
  type: string;
  props: Record<string, unknown>;
}

export async function fetchSavedBlocks(): Promise<SavedBlock[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_blocks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Erro ao buscar blocos salvos:", error.message);
    return [];
  }
  return (data ?? []) as SavedBlock[];
}

export async function createSavedBlock(input: Omit<SavedBlock, "id">): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("saved_blocks").insert([input]);
  return { error: error?.message ?? null };
}

export async function deleteSavedBlock(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("saved_blocks").delete().eq("id", id);
  return { error: error?.message ?? null };
}
