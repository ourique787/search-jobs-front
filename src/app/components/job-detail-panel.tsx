import { ExternalLink, Code2, Calendar, Building2, Briefcase } from "lucide-react";

const EMPRESA_DESCONHECIDA = "Não informada";
import { api } from "@/services/api";
import { SENIORIDADE_DISPLAY } from "@/types";
import type { Job } from "@/types";
import { TrendingWidget } from "./trending-widget";
import { RobotStatusWidget } from "./robot-status-widget";

interface JobDetailPanelProps {
  job: Job | null;
  allJobs: Job[];
}

const COMPANY_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#d97706",
  "#059669", "#4f46e5", "#dc2626", "#0891b2",
];

function getCompanyColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COMPANY_COLORS[hash % COMPANY_COLORS.length];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function JobDetailPanel({ job, allJobs }: JobDetailPanelProps) {
  if (!job) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-secondary/20">
        <div className="max-w-md mx-auto">
          <div className="text-center py-10 mb-6">
            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Code2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              Selecione uma vaga
            </h3>
            <p className="text-sm text-muted-foreground">
              Clique em uma vaga à esquerda para ver os detalhes aqui.
            </p>
          </div>
          <div className="space-y-4">
            <TrendingWidget jobs={allJobs} />
            <RobotStatusWidget jobCount={allJobs.length} />
          </div>
        </div>
      </div>
    );
  }

  const handleApply = async () => {
    try {
      await api.jobs.click(job.id);
    } catch {
      // silencia erro — não bloqueia navegação
    }
    window.open(job.linkOriginal, "_blank", "noopener,noreferrer");
  };

  const companyColor = getCompanyColor(job.empresa);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Cabeçalho da vaga */}
      <div className="bg-card border-b border-border p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm ${
              job.empresa === EMPRESA_DESCONHECIDA ? "text-primary" : "text-white"
            }`}
            style={{
              backgroundColor: job.empresa === EMPRESA_DESCONHECIDA
                ? "var(--color-accent)"
                : companyColor,
            }}
          >
            {job.empresa === EMPRESA_DESCONHECIDA
              ? <Briefcase className="w-6 h-6" />
              : job.empresa[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            {job.empresa !== EMPRESA_DESCONHECIDA && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-0.5">
                <Building2 className="w-3.5 h-3.5" />
                {job.empresa}
              </p>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
              {job.titulo}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                {SENIORIDADE_DISPLAY[job.senioridade]}
              </span>
              <span className="text-xs bg-secondary border border-border px-2.5 py-1 rounded-full text-muted-foreground">
                via {job.fonte}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(job.dataColeta)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleApply}
          className="mt-5 w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          Ver Vaga Original
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Stack de tecnologias */}
        {job.stacksRequisitadas.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              Tecnologias Requisitadas
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.stacksRequisitadas.map((s) => (
                <span
                  key={s.id}
                  className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-default"
                >
                  {s.nome}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Descrição */}
        {job.descricao?.trim() && (
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Descrição
            </h3>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-card border border-border rounded-xl p-4">
              {job.descricao}
            </div>
          </section>
        )}

        {/* Cards de meta */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Fonte</p>
            <p className="text-sm font-semibold text-foreground">{job.fonte}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Coletado em</p>
            <p className="text-sm font-semibold text-foreground">
              {formatDate(job.dataColeta)}
            </p>
          </div>
        </div>

        {/* CTA secundário */}
        <button
          onClick={handleApply}
          className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          Ver Vaga Original
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
