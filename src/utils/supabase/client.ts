import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

// Singleton: uma única instância no browser. Criar um cliente novo a cada render fazia
// uploads/queries dispararem antes da sessão (cookies) hidratar — caindo como anônimo e
// batendo no RLS ("new row violates row-level security policy") — além do aviso de
// "Multiple GoTrueClient instances". Com instância única, a sessão fica carregada e
// compartilhada por todos os componentes.
function makeClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}

let browserClient: ReturnType<typeof makeClient> | undefined;

export function createClient() {
  browserClient ??= makeClient();
  return browserClient;
}
