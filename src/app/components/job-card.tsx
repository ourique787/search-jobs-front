import { Briefcase, Clock } from "lucide-react";
import { SENIORIDADE_DISPLAY } from "@/types";
import type { Job } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { formatTitle } from "@/utils/format";

const EMPRESA_DESCONHECIDA = "Não informada";

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  isMatch?: boolean;
  onClick: () => void;
}

const COMPANY_COLORS = [
  "#14532d", "#1e3a5f", "#3b0764", "#7c2d12",
  "#164e63", "#1a2e05", "#713f12", "#0f172a",
];

function getCompanyColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COMPANY_COLORS[hash % COMPANY_COLORS.length];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hoje";
  if (days === 1) return "1 dia atrás";
  return `${days} dias atrás`;
}

export function JobCard({ job, isSelected, isMatch = false, onClick }: JobCardProps) {
  const isUnknown = job.empresa === EMPRESA_DESCONHECIDA;
  const { user } = useAuth();
  const preferredStacks = user?.stacksPreferidas?.map((s) => s.nome) ?? [];

  const sortedStacks = [...job.stacksRequisitadas].sort(
    (a, b) =>
      (preferredStacks.includes(a.nome) ? 0 : 1) -
      (preferredStacks.includes(b.nome) ? 0 : 1)
  );
  const visible = sortedStacks.slice(0, 3);
  const hidden = sortedStacks.length - visible.length;

  return (
    <div
      onClick={onClick}
      className={`px-4 py-4 cursor-pointer border-b border-border transition-colors relative select-none border-l-2 ${
        isSelected
          ? "bg-accent/5 border-l-accent"
          : isMatch
            ? "border-l-primary/30 hover:bg-secondary/40"
            : "border-l-transparent hover:bg-secondary/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            isUnknown ? "bg-secondary" : "text-white"
          }`}
          style={isUnknown ? undefined : { backgroundColor: getCompanyColor(job.empresa) }}
        >
          {isUnknown
            ? <Briefcase className="w-5 h-5 text-muted-foreground" />
            : job.empresa[0]?.toUpperCase() ?? "?"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {!isUnknown && (
                <p className="text-xs font-display font-medium text-foreground truncate leading-tight">
                  {job.empresa}
                </p>
              )}
              <p className="text-xs font-mono text-muted-foreground truncate leading-tight">
                {job.fonte}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isMatch && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-success-soft text-success border border-success/30 px-1.5 py-0.5 rounded-full leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                  match
                </span>
              )}
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-[12px] font-mono text-muted-foreground">{timeAgo(job.dataColeta)}</span>
            </div>
          </div>

          <p className={`text-sm font-display font-medium mt-2 leading-snug line-clamp-2 ${
            isSelected ? "text-primary" : "text-foreground"
          }`}>
            {formatTitle(job.titulo)}
          </p>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-xs font-mono bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
              {SENIORIDADE_DISPLAY[job.senioridade]}
            </span>
            {visible.map((s) => (
              <span
                key={s.id}
                className="text-xs font-mono bg-transparent border border-border text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap"
              >
                {s.nome}
              </span>
            ))}
            {hidden > 0 && (
              <span className="text-xs font-mono text-muted-foreground/70 whitespace-nowrap">
                +{hidden}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
