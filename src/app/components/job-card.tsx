import { SENIORIDADE_DISPLAY } from "@/types";
import type { Job } from "@/types";

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onClick: () => void;
}

const COMPANY_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#d97706",
  "#059669", "#4f46e5", "#dc2626", "#0891b2",
];

function getCompanyColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COMPANY_COLORS[hash % COMPANY_COLORS.length];
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3.5 cursor-pointer border-b border-border transition-colors relative select-none ${
        isSelected ? "bg-accent/5" : "hover:bg-secondary/40"
      }`}
    >
      {/* Indicador de seleção */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-0.5 transition-colors ${
          isSelected ? "bg-accent" : "bg-transparent"
        }`}
      />

      <div className="flex items-start gap-3 pl-1">
        {/* Ícone da empresa */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
          style={{ backgroundColor: getCompanyColor(job.empresa) }}
        >
          {job.empresa[0]?.toUpperCase() ?? "?"}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate leading-tight">
            {job.empresa}
          </p>
          <p
            className={`text-sm font-semibold mt-0.5 leading-snug line-clamp-2 ${
              isSelected ? "text-primary" : "text-foreground"
            }`}
          >
            {job.titulo}
          </p>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              {SENIORIDADE_DISPLAY[job.senioridade]}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              · {job.fonte}
            </span>
          </div>

          {job.stacksRequisitadas.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {job.stacksRequisitadas.slice(0, 3).map((s) => (
                <span
                  key={s.id}
                  className="text-xs bg-secondary border border-border rounded px-1.5 py-0.5 whitespace-nowrap"
                >
                  {s.nome}
                </span>
              ))}
              {job.stacksRequisitadas.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{job.stacksRequisitadas.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
