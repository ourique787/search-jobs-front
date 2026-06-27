import { ExternalLink, Code2, Calendar, Building2, Briefcase, X, CheckCircle2, Sparkles, Layers } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { SENIORIDADE_DISPLAY } from "@/types";
import type { Job } from "@/types";
const EMPRESA_DESCONHECIDA = "não informada";

interface JobDetailPanelProps {
  job: Job | null;
  onClose?: () => void;
}

const COMPANY_COLORS = [
  "#14532d", "#1e3a5f", "#3b0764", "#7c2d12",
  "#164e63", "#1a2e05", "#713f12", "#0f172a",
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

// ── Description formatter ─────────────────────────────────────────────────
// Parses raw scraped text into structured segments and renders as React
// elements. Never uses dangerouslySetInnerHTML — all values are text nodes.

type DescSeg =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

const BULLET_RE = /^[-–—•*·]\s*\.?\s+/;
const LABEL_RE = /^([A-ZÁÉÍÓÚÀÂÊÔÃÕÇ][A-ZÁÉÍÓÚÀÂÊÔÃÕÇa-záéíóúàâêôãõç\s/]{0,49}):\s*(.*)/;
const KNOWN_LABELS = new Set([
  "benefícios", "beneficios", "requisitos", "habilidades", "exigências",
  "exigencias", "experiência", "experiencia", "responsabilidades", "atividades",
  "atribuições", "atribuicoes", "formação", "formacao", "local", "horário",
  "horario", "contrato", "salário", "salario", "sobre", "diferenciais",
  "tarefas", "perfil", "competências", "competencias", "qualificações",
  "qualificacoes", "modelo", "regime", "prazo", "vaga",
]);

function detectLabel(line: string): { label: string; rest: string } | null {
  const m = line.match(LABEL_RE);
  if (!m) return null;
  const label = m[1].trim();
  if (label.split(" ").length > 5) return null;
  const isAllCaps = /^[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\s]+$/.test(label) && /[A-Z]/.test(label);
  const isKnown = KNOWN_LABELS.has(label.toLowerCase());
  if (!isAllCaps && !isKnown) return null;
  return { label, rest: m[2].trim() };
}

function parseDescription(raw: string): DescSeg[] {
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    // Insert missing space after colon ("TAREFAS:Atuar" → "TAREFAS: Atuar")
    // but not URLs (https://) or paths (src/index)
    .replace(/([A-ZÁÉÍÓÚÀÂÊÔÃÕÇa-záéíóúàâêôãõç]):([^\s\n/])/g, "$1: $2");

  const rawLines = normalized.split("\n").map((l) => l.trim());

  // De-duplicate consecutive identical lines; preserve blanks as separators
  const lines: string[] = [];
  for (const line of rawLines) {
    if (!line) { lines.push(""); continue; }
    if (lines[lines.length - 1] !== line) lines.push(line);
  }

  const segments: DescSeg[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      segments.push({ type: "list", items: [...listItems] });
      listItems = [];
    }
  };

  for (const line of lines) {
    if (!line) { flushList(); continue; }

    if (BULLET_RE.test(line)) {
      const item = line.replace(BULLET_RE, "").trim();
      if (item) listItems.push(item);
      continue;
    }

    flushList();

    const lbl = detectLabel(line);
    if (lbl) {
      segments.push({ type: "heading", text: lbl.label });
      if (lbl.rest) {
        if (BULLET_RE.test(lbl.rest)) {
          listItems.push(lbl.rest.replace(BULLET_RE, "").trim());
        } else {
          segments.push({ type: "paragraph", text: lbl.rest });
        }
      }
      continue;
    }

    segments.push({ type: "paragraph", text: line });
  }

  flushList();

  // De-duplicate consecutive identical segments
  const result: DescSeg[] = [];
  for (const seg of segments) {
    const prev = result[result.length - 1];
    if (!prev) { result.push(seg); continue; }
    if (seg.type === "paragraph" && prev.type === "paragraph" && seg.text === prev.text) continue;
    if (seg.type === "heading" && prev.type === "heading" && seg.text === prev.text) continue;
    result.push(seg);
  }

  return result;
}

function DescriptionRenderer({ text }: { text: string }) {
  const segments = parseDescription(text);

  return (
    <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.type === "heading") {
          return (
            <p key={i} className="text-xs font-semibold text-foreground uppercase tracking-wide pt-3 first:pt-0">
              {seg.text}
            </p>
          );
        }
        if (seg.type === "list") {
          return (
            <ul key={i} className="space-y-1 pl-1">
              {seg.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span className="mt-[0.4rem] w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{seg.text}</p>;
      })}
    </div>
  );
}

export function JobDetailPanel({ job, onClose }: JobDetailPanelProps) {
  const { user } = useAuth();

  if (!job) {
    return (
      <div className="flex-1 flex items-center justify-center bg-secondary/20">
        <div className="text-center px-6">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Code2 className="w-6 h-6 text-primary/60" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Nenhuma vaga selecionada</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Clique em uma vaga para ver os detalhes.
          </p>
        </div>
      </div>
    );
  }

  const handleApply = async () => {
    try { await api.jobs.click(job.id); } catch { /* silencia */ }
    window.open(job.linkOriginal, "_blank", "noopener,noreferrer");
  };

  const userStackNames = user?.stacksPreferidas?.map((s) => s.nome) ?? [];
  const matchingStacks = job.stacksRequisitadas.filter((s) => userStackNames.includes(s.nome));
  const hasSeniorityPref = !!user?.senioridadeAlvo;
  const hasStackPref = userStackNames.length > 0;
  const senioridadeMatch = hasSeniorityPref && user!.senioridadeAlvo === job.senioridade;
  const stackMatch = hasStackPref && matchingStacks.length > 0;
  // cada dimensão configurada deve bater; dimensão não configurada não penaliza
  const hasQualifications =
    (hasSeniorityPref || hasStackPref) &&
    (!hasSeniorityPref || senioridadeMatch) &&
    (!hasStackPref || stackMatch);

  const isUnknown = job.empresa === EMPRESA_DESCONHECIDA;
  const companyColor = isUnknown ? null : getCompanyColor(job.empresa);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Cabeçalho */}
      <div className="relative bg-card border-b border-border p-5 sm:p-6">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Fechar vaga"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${
              isUnknown ? "bg-secondary" : "text-white shadow-sm"
            }`}
            style={companyColor ? { backgroundColor: companyColor } : undefined}
          >
            {isUnknown
              ? <Briefcase className="w-6 h-6 text-muted-foreground" />
              : job.empresa[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <h2 className="text-lg sm:text-xl font-display font-bold text-foreground leading-tight">
              {job.titulo}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              {!isUnknown && (
                <>
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{job.empresa}</span>
                  <span className="text-border">·</span>
                </>
              )}
              <span className="font-mono">{job.fonte}</span>
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs font-mono bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                {SENIORIDADE_DISPLAY[job.senioridade]}
              </span>
              {hasQualifications && (
                <span className="flex items-center gap-1 text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  recomendada para você
                </span>
              )}
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
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
          ver vaga original
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-5 sm:p-6 space-y-6">

        {/* Suas qualificações */}
        {hasQualifications && (
          <section className="bg-success-soft border border-success/20 rounded-xl p-4">
            <h3 className="text-sm font-display font-medium text-foreground mb-3">
              suas qualificações para esta vaga
            </h3>
            <div className="space-y-2">
              {senioridadeMatch && (
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-sm font-mono text-foreground">
                    {SENIORIDADE_DISPLAY[job.senioridade]}
                  </span>
                </div>
              )}
              {matchingStacks.map((s) => (
                <div key={s.id} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-sm font-mono text-foreground">{s.nome}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tecnologias requisitadas */}
        {job.stacksRequisitadas.length > 0 && (
          <section>
            <h3 className="text-sm font-display font-medium text-foreground mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              tecnologias requisitadas
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.stacksRequisitadas.map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 rounded-full text-xs font-mono border border-border text-muted-foreground bg-transparent cursor-default"
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
            <h3 className="text-sm font-display font-medium text-foreground mb-3">descrição</h3>
            <div className="bg-card border border-border rounded-xl p-4">
              <DescriptionRenderer text={job.descricao!} />
            </div>
          </section>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Fonte</p>
            <p className="text-sm font-mono text-foreground">{job.fonte}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Coletado em</p>
            <p className="text-sm font-mono text-foreground">{formatDate(job.dataColeta)}</p>
          </div>
        </div>

        <button
          onClick={handleApply}
          className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          ver vaga original
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
