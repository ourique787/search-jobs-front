export const SENHA_REGEX = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
export const SENHA_ERRO = "Senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um símbolo";

/**
 * Normalizes a job title for display only — never mutates the stored value.
 * - Strips leading numeric ID prefixes like "00074/2026 - "
 * - Removes parentheticals that are pure numeric/alphanumeric codes (e.g. "(13067)")
 * - Cleans internal whitespace in significant parentheticals
 * - Collapses multiple spaces and trims
 */
export function formatTitle(title: string): string {
  return title
    // Strip leading job-ID prefixes like "00074/2026 - "
    .replace(/^\d+\/\d+\s*[-–]\s*/, "")
    // Process parentheticals
    .replace(/\s*\(\s*([^)]*?)\s*\)\s*/g, (_, inner) => {
      const trimmed = inner.trim();
      // Pure code: no whitespace, contains digits → remove
      if (/^[\w-]+$/.test(trimmed) && /\d/.test(trimmed)) return " ";
      return ` (${trimmed.replace(/\s+/g, " ")}) `;
    })
    .replace(/\s+/g, " ")
    .trim();
}
