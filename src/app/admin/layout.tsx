import { ReactNode } from "react";

// Paleta dark tech — inspirada em Linear / Vercel / SaaS moderno
const adminTheme = {
  "--theme-primary":       "#6366F1", // Indigo-500
  "--theme-primary-dark":  "#4F46E5",
  "--theme-primary-light": "#818CF8",
  "--theme-primary-soft":  "rgba(99,102,241,0.15)",
  "--theme-primary-bg":    "rgba(99,102,241,0.08)",
  "--theme-primary-hover": "#4F46E5",
  "--theme-surface-50":    "#0C0C14",
  "--theme-surface-100":   "#12121C",
  "--theme-surface-200":   "#1C1C2E",
  "--theme-text-heading":  "#F1F5F9",
  "--theme-text-body":     "#94A3B8",
  "--theme-tertiary":      "#334155",
} as React.CSSProperties;

/* Donut scoping: os overrides do tema dark aplicam do `.admin-root` para baixo, mas PARAM em
   `.canvas-render` — a fronteira do conteúdo do site no canvas. Assim o preview renderiza o site
   exatamente como publicado, imune ao tema do editor. As variáveis (style={adminTheme}) ficam fora
   daqui e são isoladas pelo `.canvas-theme-root` (cascade). Dentro do @scope os seletores são
   relativos à raiz do escopo, então usa-se `:scope`/seletores sem o prefixo `.admin-root`. */
const darkCss = `
@scope (.admin-root) to (.canvas-render) {
  :scope { background-color: #0C0C14; }

  /* Cards e superfícies */
  .bg-white { background-color: #12121C !important; }

  /* Bordas */
  .border-text-100 { border-color: #1C1C2E !important; }
  .border-text-200 { border-color: #252540 !important; }

  /* bg-text-100/200 são hardcoded em globals.css (não usam CSS vars de tema) */
  .bg-text-100 { background-color: #1C1C2E !important; }
  .bg-text-100\\/50 { background-color: rgba(28,28,46,0.5) !important; }
  .bg-text-200 { background-color: #252540 !important; }

  /* Divisores de tabela — usa general sibling (~) igual ao Tailwind divide-y */
  .divide-text-100 > :not([hidden]) ~ :not([hidden]) { border-color: #1C1C2E !important; }
  thead tr { border-bottom: 1px solid #1C1C2E !important; }
  th, td { border-color: #1C1C2E !important; }

  /* Textos com opacity-mix ficam quase invisíveis em dark — forçar valores sólidos */
  .text-text-500 { color: #94A3B8 !important; }
  .text-text-400 { color: #64748B !important; }
  .text-text-300 { color: #475569 !important; }

  /* Inputs e forms */
  input:not([type=color]),
  textarea,
  select {
    background-color: #1C1C2E !important;
    color: #E2E8F0 !important;
    border-color: #252540 !important;
  }
  input::placeholder,
  textarea::placeholder { color: #475569 !important; }
  input:focus:not([type=color]),
  textarea:focus {
    border-color: #6366F1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
  }

  /* Badges coloridos hardcoded do Tailwind */
  .bg-green-100 { background-color: rgba(34,197,94,0.12) !important; }
  .text-green-600 { color: #4ADE80 !important; }
  .bg-amber-50  { background-color: rgba(245,158,11,0.1) !important; }
  .text-amber-700 { color: #FCD34D !important; }
  .border-amber-200 { border-color: rgba(245,158,11,0.25) !important; }

  /* Hover nos botões de ação (edit/delete) */
  .hover\\:bg-blue-50:hover { background-color: rgba(99,102,241,0.1) !important; }
  .hover\\:text-blue-600:hover { color: #818CF8 !important; }
  .hover\\:bg-red-50:hover { background-color: rgba(239,68,68,0.1) !important; }
  .hover\\:text-red-600:hover { color: #F87171 !important; }

  /* Toggle switch — knob não pode usar bg-white (vira dark) */
  .toggle-knob { background-color: #E2E8F0 !important; }

  /* Fontes */
  .font-display { font-family: inherit !important; }

  /* Sombras */
  .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.7) !important; }
  .shadow-lg { box-shadow: 0 4px 24px rgba(0,0,0,0.6) !important; }
  .shadow-md { box-shadow: 0 4px 12px rgba(99,102,241,0.25) !important; }

  /* ===== Editor: classes zinc literais (não seguem os tokens de tema) → dark ===== */

  /* Superfícies */
  .bg-zinc-50 { background-color:#12121C !important; }
  .bg-zinc-50\\/50 { background-color:rgba(18,18,28,0.6) !important; }
  .bg-zinc-50\\/80 { background-color:rgba(18,18,28,0.85) !important; }
  .bg-zinc-50\\/30 { background-color:rgba(18,18,28,0.4) !important; }
  .bg-zinc-100 { background-color:#1C1C2E !important; }
  .bg-zinc-200 { background-color:#252540 !important; }
  .hover\\:bg-zinc-50:hover { background-color:#1C1C2E !important; }
  .hover\\:bg-zinc-100:hover { background-color:#252540 !important; }
  .group:hover .group-hover\\:bg-zinc-200 { background-color:#252540 !important; }
  .from-zinc-100 { --tw-gradient-from:#1C1C2E var(--tw-gradient-from-position) !important; }
  .to-zinc-50 { --tw-gradient-to:#12121C var(--tw-gradient-to-position) !important; }

  /* Bordas */
  .border-zinc-50 { border-color:#1C1C2E !important; }
  .border-zinc-100 { border-color:#1C1C2E !important; }
  .border-zinc-200 { border-color:#252540 !important; }
  .hover\\:border-zinc-200:hover { border-color:#334155 !important; }
  .hover\\:border-zinc-300:hover { border-color:#3A3A5C !important; }
  .hover\\:border-zinc-400:hover { border-color:#475569 !important; }
  .focus\\:border-zinc-400:focus { border-color:#6366F1 !important; }
  .focus\\:border-zinc-900:focus { border-color:#6366F1 !important; }

  /* Texto (dark → claro) */
  .text-zinc-900 { color:#F1F5F9 !important; }
  .text-zinc-800 { color:#E2E8F0 !important; }
  .text-zinc-700 { color:#CBD5E1 !important; }
  .text-zinc-600 { color:#94A3B8 !important; }
  .text-zinc-500 { color:#94A3B8 !important; }
  .text-zinc-400 { color:#64748B !important; }
  .text-zinc-300 { color:#475569 !important; }
  .hover\\:text-zinc-900:hover { color:#F1F5F9 !important; }
  .hover\\:text-zinc-800:hover { color:#E2E8F0 !important; }
  .hover\\:text-zinc-700:hover { color:#CBD5E1 !important; }
  .hover\\:text-zinc-600:hover { color:#94A3B8 !important; }
  .group:hover .group-hover\\:text-zinc-400 { color:#94A3B8 !important; }

  /* Rings / seleção */
  .ring-zinc-900 { --tw-ring-color:#6366F1 !important; }
  .ring-zinc-200 { --tw-ring-color:#252540 !important; }
  .ring-zinc-400 { --tw-ring-color:#475569 !important; }
  .ring-zinc-400\\/40 { --tw-ring-color:rgba(99,102,241,0.4) !important; }
  .focus\\:ring-zinc-400:focus { --tw-ring-color:#6366F1 !important; }

  /* Badges de categoria e botões semânticos (pílulas claras → tonalidade dark) */
  .bg-blue-50 { background-color:rgba(99,102,241,0.12) !important; }
  .text-blue-600 { color:#818CF8 !important; }
  .border-blue-100 { border-color:rgba(99,102,241,0.25) !important; }
  .bg-violet-50 { background-color:rgba(139,92,246,0.12) !important; }
  .text-violet-600 { color:#A78BFA !important; }
  .border-violet-100 { border-color:rgba(139,92,246,0.25) !important; }
  .bg-red-50 { background-color:rgba(239,68,68,0.1) !important; }
  .text-red-600 { color:#F87171 !important; }
  .text-red-500 { color:#F87171 !important; }
  .border-red-100 { border-color:rgba(239,68,68,0.25) !important; }
}
`;

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root font-sans" style={adminTheme}>
      <style>{darkCss}</style>
      {children}
    </div>
  );
}
