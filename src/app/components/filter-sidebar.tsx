import { Search, SlidersHorizontal } from "lucide-react";
import type { Stack } from "@/types";

interface FilterSidebarProps {
  stacks: Stack[];
  selectedSeniorities: string[];
  selectedTechs: string[];
  onSeniorityChange: (seniority: string) => void;
  onTechChange: (tech: string) => void;
  techSearch: string;
  onTechSearchChange: (search: string) => void;
}

const seniorities = ["Estágio", "Júnior", "Pleno", "Sênior"];

export function FilterSidebar({
  stacks,
  selectedSeniorities,
  selectedTechs,
  onSeniorityChange,
  onTechChange,
  techSearch,
  onTechSearchChange,
}: FilterSidebarProps) {
  const filteredStacks = stacks.filter((s) =>
    s.nome.toLowerCase().includes(techSearch.toLowerCase())
  );

  const hasFilters = selectedSeniorities.length > 0 || selectedTechs.length > 0;

  return (
    <div className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 pt-6 sm:pt-8 pb-4 overflow-y-auto bg-background">
      <aside className="flex flex-col bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span className="text-base font-semibold text-foreground">Filtros</span>
          {hasFilters && (
            <button
              onClick={() => {
                selectedSeniorities.forEach(onSeniorityChange);
                selectedTechs.forEach(onTechChange);
              }}
              className="ml-auto text-xs text-primary hover:underline font-medium"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Senioridade */}
        <div className="px-4 py-4 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Senioridade
          </p>
          <div className="space-y-2.5">
            {seniorities.map((seniority) => (
              <label
                key={seniority}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedSeniorities.includes(seniority)}
                  onChange={() => onSeniorityChange(seniority)}
                  className="w-4 h-4 rounded border-border accent-[#6366F1]"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {seniority}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Tecnologias */}
        <div className="px-4 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Tecnologias
          </p>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={techSearch}
              onChange={(e) => onTechSearchChange(e.target.value)}
              placeholder="Buscar tecnologia..."
              className="w-full pl-8 pr-3 py-1.5 bg-secondary border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {filteredStacks.map((stack) => (
              <label
                key={stack.id}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedTechs.includes(stack.nome)}
                  onChange={() => onTechChange(stack.nome)}
                  className="w-4 h-4 rounded border-border accent-[#6366F1]"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {stack.nome}
                </span>
              </label>
            ))}
            {filteredStacks.length === 0 && (
              <p className="text-xs text-muted-foreground py-1">
                Nenhuma encontrada.
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
