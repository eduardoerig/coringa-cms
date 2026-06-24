// Leitura validada das variáveis de ambiente do Supabase.
// Centraliza o acesso (em vez de `process.env...!` espalhado) e dá uma mensagem de erro
// CLARA quando a configuração está errada — em especial o caso que derrubou login e upload
// na Vercel: `NEXT_PUBLIC_SUPABASE_URL` com um caminho (ex.: `/rest/v1`) ou barra no final,
// que faz o cliente Supabase montar URLs duplicadas (`/rest/v1/rest/v1/...`) e receber 404.

function fail(message: string): never {
  throw new Error(`[Supabase] ${message}`);
}

/** URL base do projeto: deve ser a origem `https://<ref>.supabase.co`, sem path. */
export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) fail("NEXT_PUBLIC_SUPABASE_URL não definida. Configure a URL do projeto (ex.: https://xxxx.supabase.co).");

  const value = raw.trim().replace(/\/+$/, ""); // tolera barra(s) no final
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    fail(`NEXT_PUBLIC_SUPABASE_URL inválida: "${raw}". Use a origem completa, ex.: https://xxxx.supabase.co`);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    fail(`NEXT_PUBLIC_SUPABASE_URL deve começar com https:// — recebido "${raw}".`);
  }
  if (url.pathname && url.pathname !== "/") {
    fail(
      `NEXT_PUBLIC_SUPABASE_URL deve ser só a origem (https://xxxx.supabase.co), sem caminho. ` +
        `Recebido "${raw}" (caminho "${url.pathname}"). Remova o sufixo (ex.: /rest/v1) e refaça o deploy.`
    );
  }
  return url.origin;
}

/** Chave pública (anon/publishable). É pública por design — pode ir no bundle. */
export function getSupabaseAnonKey(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!raw || !raw.trim()) fail("NEXT_PUBLIC_SUPABASE_ANON_KEY não definida.");
  return raw.trim();
}
