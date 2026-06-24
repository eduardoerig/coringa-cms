// Sanitização de URLs vindas do usuário antes de virarem href/src no site público.
// Bloqueia protocolos perigosos (javascript:, vbscript:, file:...) que permitiriam
// execução de script ao clicar num link/botão ou ao carregar um iframe.

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Devolve a URL se o protocolo for seguro; caso contrário, `fallback` (padrão "").
 * URLs relativas (sem protocolo) e âncoras (#) passam direto.
 * Use `allowDataImage` para liberar `data:image/...` (somente em <img>).
 */
export function safeUrl(raw: unknown, fallback = "", allowDataImage = false): string {
  if (typeof raw !== "string") return fallback;
  const value = raw.trim();
  if (!value) return fallback;
  // Relativo ou âncora: seguro, não tem protocolo para abusar.
  if (value.startsWith("/") || value.startsWith("#") || value.startsWith("./") || value.startsWith("../")) {
    return value;
  }
  if (allowDataImage && /^data:image\//i.test(value)) return value;
  try {
    const proto = new URL(value).protocol.toLowerCase();
    return SAFE_PROTOCOLS.has(proto) ? value : fallback;
  } catch {
    // Sem protocolo reconhecível (ex.: "exemplo.com/x") — tratamos como relativo seguro.
    return value;
  }
}
