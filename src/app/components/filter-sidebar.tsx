import { Search } from "lucide-react";
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

  return (
    <aside className="w-full lg:w-72 bg-card border border-border rounded-xl p-4 sm:p-6 h-fit sticky top-24">
      <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">
        Filtros
      </h2>

      {/* Seniority Filter */}
      <div className="mb-6">
        <h3 className="text-xs sm:text-sm font-medium text-foreground mb-3">
          Senioridade
        </h3>
        <div className="space-y-2">
          {seniorities.map((seniority) => (
            <label
              key={seniority}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedSeniorities.includes(seniority)}
                onChange={() => onSeniorityChange(seniority)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent focus:ring-2"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                {seniority}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Technology Filter */}
      <div>
        <h3 className="text-xs sm:text-sm font-medium text-foreground mb-3">
          Stack / Tecnologias
        </h3>

        {/* Tech Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={techSearch}
            onChange={(e) => onTechSearchChange(e.target.value)}
            placeholder="Buscar tecnologia..."
            className="w-full pl-9 pr-3 py-2 bg-input-background border border-input rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>

        {/* Tech Checkboxes */}
        <div className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto custom-scrollbar">
          {filteredStacks.map((stack) => (
            <label
              key={stack.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedTechs.includes(stack.nome)}
                onChange={() => onTechChange(stack.nome)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent focus:ring-2"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                {stack.nome}
              </span>
            </label>
          ))}

          {filteredStacks.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">
              Nenhuma tecnologia encontrada.
            </p>
          )}
        </div>
      </div>

      {/* Clear Filters Button */}
      {(selectedSeniorities.length > 0 || selectedTechs.length > 0) && (
        <button
          onClick={() => {
            selectedSeniorities.forEach(onSeniorityChange);
            selectedTechs.forEach(onTechChange);
          }}
          className="w-full mt-6 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors text-xs sm:text-sm font-medium"
        >
          Limpar filtros
        </button>
      )}
    </aside>
  );
}
