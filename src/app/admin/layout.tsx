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

const darkCss = `
  .admin-root { background-color: #0C0C14; }

  /* Cards e superfícies */
  .admin-root .bg-white { background-color: #12121C !important; }

  /* Bordas */
  .admin-root .border-text-100 { border-color: #1C1C2E !important; }
  .admin-root .border-text-200 { border-color: #252540 !important; }

  /* bg-text-100/200 são hardcoded em globals.css (não usam CSS vars de tema) */
  .admin-root .bg-text-100 { background-color: #1C1C2E !important; }
  .admin-root .bg-text-100\\/50 { background-color: rgba(28,28,46,0.5) !important; }
  .admin-root .bg-text-200 { background-color: #252540 !important; }

  /* Divisores de tabela — usa general sibling (~) igual ao Tailwind divide-y */
  .admin-root .divide-text-100 > :not([hidden]) ~ :not([hidden]) { border-color: #1C1C2E !important; }
  .admin-root thead tr { border-bottom: 1px solid #1C1C2E !important; }
  .admin-root table { border-collapse: collapse; }
  .admin-root th, .admin-root td { border-color: #1C1C2E !important; }

  /* Textos com opacity-mix ficam quase invisíveis em dark — forçar valores sólidos */
  .admin-root .text-text-500 { color: #94A3B8 !important; }
  .admin-root .text-text-400 { color: #64748B !important; }
  .admin-root .text-text-300 { color: #475569 !important; }

  /* Inputs e forms */
  .admin-root input:not([type=color]),
  .admin-root textarea,
  .admin-root select {
    background-color: #1C1C2E !important;
    color: #E2E8F0 !important;
    border-color: #252540 !important;
  }
  .admin-root input::placeholder,
  .admin-root textarea::placeholder { color: #475569 !important; }
  .admin-root input:focus:not([type=color]),
  .admin-root textarea:focus {
    border-color: #6366F1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
  }

  /* Badges coloridos hardcoded do Tailwind */
  .admin-root .bg-green-100 { background-color: rgba(34,197,94,0.12) !important; }
  .admin-root .text-green-600 { color: #4ADE80 !important; }
  .admin-root .bg-amber-50  { background-color: rgba(245,158,11,0.1) !important; }
  .admin-root .text-amber-700 { color: #FCD34D !important; }
  .admin-root .border-amber-200 { border-color: rgba(245,158,11,0.25) !important; }

  /* Hover nos botões de ação (edit/delete) */
  .admin-root .hover\\:bg-blue-50:hover { background-color: rgba(99,102,241,0.1) !important; }
  .admin-root .hover\\:text-blue-600:hover { color: #818CF8 !important; }
  .admin-root .hover\\:bg-red-50:hover { background-color: rgba(239,68,68,0.1) !important; }
  .admin-root .hover\\:text-red-600:hover { color: #F87171 !important; }

  /* Toggle switch — knob não pode usar bg-white (vira dark) */
  .admin-root .toggle-knob { background-color: #E2E8F0 !important; }

  /* Fontes */
  .admin-root .font-display { font-family: inherit !important; }

  /* Sombras */
  .admin-root .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.7) !important; }
  .admin-root .shadow-lg { box-shadow: 0 4px 24px rgba(0,0,0,0.6) !important; }
  .admin-root .shadow-md { box-shadow: 0 4px 12px rgba(99,102,241,0.25) !important; }
`;

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root font-sans" style={adminTheme}>
      <style>{darkCss}</style>
      {children}
    </div>
  );
}
