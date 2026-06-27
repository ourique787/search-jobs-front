import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  TrendingUp,
  Building2,
  Layers,
  ExternalLink,
  Filter,
  RefreshCw,
  Calendar,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Header } from "./header";
import { api } from "@/services/api";
import { SENIORIDADE_DISPLAY } from "@/types";
import { formatTitle } from "@/utils/format";
import type { RelatorioDTO, Senioridade, Stack } from "@/types";

// ── Constantes ──────────────────────────────────────────────────────────────

const SENIORITY_OPTIONS: { value: Senioridade; label: string }[] = [
  { value: "ESTAGIARIO", label: "Estágio" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
  { value: "NAO_INFORMADO", label: "Não Informado" },
];

// Uniform chart color: all bars use the brand indigo.
// Bars are distinguished by their axis label and height — never by color.
const CHART_PRIMARY = "var(--primary)";

const DIA_ABBR: Record<string, string> = {
  SEGUNDA: "Seg",
  TERÇA:   "Ter",
  QUARTA:  "Qua",
  QUINTA:  "Qui",
  SEXTA:   "Sex",
  SÁBADO:  "Sáb",
  DOMINGO: "Dom",
};

const ITEMS_PER_PAGE = 10;

// Names to exclude from "Top" computations (unknown/null categories).
const UNKNOWN_NAMES = new Set(["", "Não Informado", "NAO_INFORMADO", "Não informado"]);

// ── Utilitários ─────────────────────────────────────────────────────────────

function formatMonth(ym: string): string {
  const [year, month] = ym.split("-");
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${months[parseInt(month) - 1]}/${year.slice(2)}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function topEntries(
  map: Record<string, number>,
  n = 8
): { name: string; value: number }[] {
  return Object.entries(map)
    .filter(([name]) => !UNKNOWN_NAMES.has(name))
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }));
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      </div>
      <div>
        <p className="text-2xl font-mono font-medium text-foreground truncate" title={String(value)}>
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-mono text-foreground">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
      <h3 className="text-sm font-display font-medium text-foreground mb-5">{title}</h3>
      {children}
    </div>
  );
}

function ChartEmpty() {
  return (
    <div className="h-[200px] flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Nenhum dado no período</p>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export function RelatoriosPage() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Filtros
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [selectedSeniorities, setSelectedSeniorities] = useState<Senioridade[]>([]);
  const [selectedStackIds, setSelectedStackIds] = useState<number[]>([]);
  const [stackSearch, setStackSearch] = useState("");
  // "todo" | days number = active preset; null = custom interval (user typed dates manually)
  const [activePreset, setActivePreset] = useState<"todo" | number | null>("todo");
  // Snapshot of the filters that produced the currently displayed report
  const [appliedFilters, setAppliedFilters] = useState({
    dataInicio: "",
    dataFim: "",
    stackIds: [] as number[],
    senioridades: [] as Senioridade[],
  });

  useEffect(() => {
    api.stacks.list().then(setStacks).catch(() => {});
    loadRelatorio({});
  }, []);

  async function loadRelatorio(params: {
    dataInicio?: string;
    dataFim?: string;
    stackIds?: number[];
    senioridades?: Senioridade[];
  }) {
    setIsLoading(true);
    setError(null);
    setPage(1);
    try {
      const data = await api.relatorio.gerar(params);
      setRelatorio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar relatório.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleGerar() {
    setAppliedFilters({
      dataInicio,
      dataFim,
      stackIds: [...selectedStackIds],
      senioridades: [...selectedSeniorities],
    });
    loadRelatorio({
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      stackIds: selectedStackIds.length ? selectedStackIds : undefined,
      senioridades: selectedSeniorities.length ? selectedSeniorities : undefined,
    });
  }

  function handleLimpar() {
    setDataInicio("");
    setDataFim("");
    setSelectedSeniorities([]);
    setSelectedStackIds([]);
    setStackSearch("");
    setActivePreset("todo");
  }

  function setPreset(value: "todo" | number) {
    setActivePreset(value);
    if (value === "todo") { setDataInicio(""); setDataFim(""); return; }
    const fim = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - (value as number));
    setDataFim(fim.toISOString().slice(0, 10));
    setDataInicio(inicio.toISOString().slice(0, 10));
  }

  function handleDateChange(field: "inicio" | "fim", value: string) {
    setActivePreset(null); // user diverged from any preset → custom interval
    if (field === "inicio") setDataInicio(value);
    else setDataFim(value);
  }

  const filteredStacks = stacks.filter((s) =>
    s.nome.toLowerCase().includes(stackSearch.toLowerCase())
  );

  // Selected stacks always visible at top, regardless of search query
  const selectedStacks = stacks.filter((s) => selectedStackIds.includes(s.id));
  const unselectedFiltered = filteredStacks.filter((s) => !selectedStackIds.includes(s.id));

  const hasFilters =
    !!dataInicio || !!dataFim ||
    selectedSeniorities.length > 0 || selectedStackIds.length > 0;

  // True when the form differs from the last applied state (report is stale)
  const isDirty =
    relatorio !== null && (
      dataInicio !== appliedFilters.dataInicio ||
      dataFim !== appliedFilters.dataFim ||
      selectedStackIds.length !== appliedFilters.stackIds.length ||
      selectedStackIds.some((id) => !appliedFilters.stackIds.includes(id)) ||
      selectedSeniorities.length !== appliedFilters.senioridades.length ||
      selectedSeniorities.some((s) => !appliedFilters.senioridades.includes(s))
    );

  // ── Dados dos gráficos ────────────────────────────────────────────────────

  const porMesData = relatorio
    ? Object.entries(relatorio.resumo.distribuicaoTemporal.porMes).map(
        ([k, v]) => ({ name: formatMonth(k), value: v })
      )
    : [];

  const porDiaData = relatorio
    ? Object.entries(relatorio.resumo.distribuicaoTemporal.porDiaDaSemana).map(
        ([k, v]) => ({ name: DIA_ABBR[k] ?? k, value: v })
      )
    : [];

  const porStackData    = relatorio ? topEntries(relatorio.resumo.porStack)   : [];
  const porFonteData    = relatorio ? topEntries(relatorio.resumo.porFonte)   : [];

  const porSenioridadeData = relatorio
    ? Object.entries(relatorio.resumo.porSenioridade).map(([k, v]) => ({
        name: SENIORIDADE_DISPLAY[k as Senioridade] ?? k,
        value: v as number,
      }))
    : [];

  const topFonte = porFonteData[0];

  // Exclude unknowns from "Top" card values
  const topSenioridade = [...porSenioridadeData]
    .filter((e) => !UNKNOWN_NAMES.has(e.name))
    .sort((a, b) => b.value - a.value)[0];

  const topStack = porStackData[0]; // topEntries already filters unknowns

  // Period label for filter banner
  const periodLabel = (() => {
    if (!relatorio) return "";
    const i = relatorio.filtrosAplicados.dataInicio;
    const f = relatorio.filtrosAplicados.dataFim;
    const empty = (v: string) => !v || v === "Sem limite";
    if (empty(i) && empty(f)) return "Todo o período";
    if (empty(i)) return `Até ${f}`;
    if (empty(f)) return `A partir de ${i}`;
    return `${i} → ${f}`;
  })();

  // Paginação
  const paginatedCandidaturas =
    relatorio?.candidaturas.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    ) ?? [];
  const totalPages = Math.ceil((relatorio?.candidaturas.length ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Toggle mobile */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden mb-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? "fechar filtros" : "abrir filtros"}
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar de Filtros ─────────────────────────────────────────── */}
          <div className={`lg:flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <aside className="w-full lg:w-72 bg-card border border-border rounded-xl p-4 sm:p-6 h-fit sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <BarChart2 className="w-4 h-4 text-primary" />
                <h2 className="text-base font-semibold text-foreground">filtros do relatório</h2>
              </div>

              {/* Período — presets + intervalo como um único controle */}
              <div className="mb-5">
                <p className="text-xs sm:text-sm font-medium text-foreground mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  período
                </p>
                {/* Atalhos rápidos */}
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {([
                    { label: "última semana", value: 7 },
                    { label: "último mês",    value: 30 },
                    { label: "3 meses",       value: 90 },
                    { label: "Todo período",  value: "todo" },
                  ] as { label: string; value: "todo" | number }[]).map(({ label, value }) => (
                    <button
                      key={label}
                      onClick={() => setPreset(value)}
                      className={`text-xs px-2 py-1.5 rounded-lg border transition-colors text-left ${
                        activePreset === value
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-secondary hover:bg-accent/10 hover:text-primary border-border"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {/* Intervalo manual */}
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground">de</label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => handleDateChange("inicio", e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-input-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">até</label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => handleDateChange("fim", e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-input-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Senioridade */}
              <div className="mb-5">
                <p className="text-xs sm:text-sm font-medium text-foreground mb-3">senioridade</p>
                <div className="space-y-2">
                  {SENIORITY_OPTIONS.map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedSeniorities.includes(value)}
                        onChange={() =>
                          setSelectedSeniorities((prev) =>
                            prev.includes(value)
                              ? prev.filter((s) => s !== value)
                              : [...prev, value]
                          )
                        }
                        className="w-4 h-4 rounded border-border accent-[#6366F1]"
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tecnologias */}
              <div className="mb-6">
                <p className="text-xs sm:text-sm font-medium text-foreground mb-3">tecnologias</p>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={stackSearch}
                    onChange={(e) => setStackSearch(e.target.value)}
                    placeholder="buscar tecnologia..."
                    className="w-full pl-9 pr-3 py-2 bg-input-background border border-input rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                </div>
                {/* Selected stacks pinned above the scrollable list */}
                {selectedStacks.length > 0 && (
                  <div className="space-y-2 mb-1">
                    {selectedStacks.map((stack) => (
                      <label key={stack.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked
                          onChange={() =>
                            setSelectedStackIds((prev) => prev.filter((id) => id !== stack.id))
                          }
                          className="w-4 h-4 rounded border-border accent-[#6366F1]"
                        />
                        <span className="text-sm text-primary font-medium">
                          {stack.nome}
                        </span>
                      </label>
                    ))}
                    {unselectedFiltered.length > 0 && (
                      <div className="border-t border-border" />
                    )}
                  </div>
                )}
                {/* Unselected, filtered by search — scrollable only when needed */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {unselectedFiltered.map((stack) => (
                    <label key={stack.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() =>
                          setSelectedStackIds((prev) => [...prev, stack.id])
                        }
                        className="w-4 h-4 rounded border-border accent-[#6366F1]"
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {stack.nome}
                      </span>
                    </label>
                  ))}
                  {unselectedFiltered.length === 0 && selectedStacks.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">
                      nenhuma tecnologia encontrada.
                    </p>
                  )}
                </div>
              </div>

              {/* Ações */}
              {isDirty && (
                <p className="text-xs text-muted-foreground text-center mb-2">
                  alterações não aplicadas
                </p>
              )}
              <button
                onClick={handleGerar}
                disabled={isLoading}
                className={`w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mb-2 shadow-sm ${
                  isDirty ? "ring-2 ring-offset-2 ring-primary/30" : ""
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                gerar relatório
              </button>

              {hasFilters && (
                <button
                  onClick={handleLimpar}
                  className="w-full py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl text-sm font-medium transition-colors"
                >
                  limpar filtros
                </button>
              )}
            </aside>
          </div>

          {/* ── Conteúdo principal ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1">relatórios</h1>
              <p className="text-sm text-muted-foreground">
                {relatorio && !isLoading
                  ? `Gerado em ${formatDateTime(relatorio.geradoEm)} · ${relatorio.resumo.totalCandidaturas} registro${relatorio.resumo.totalCandidaturas !== 1 ? "s" : ""}`
                  : "visualize suas vagas clicadas com filtros personalizados."}
              </p>
            </div>

            {isLoading && (
              <div className="flex justify-center py-24">
                <div className="w-9 h-9 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {error && !isLoading && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <p className="text-destructive font-medium mb-1">{error}</p>
                <p className="text-muted-foreground text-sm">
                  verifique se o backend está em execução e tente novamente.
                </p>
              </div>
            )}

            {relatorio && !isLoading && (
              <>
                {/* Banner de filtros aplicados */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-6 flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-semibold text-primary">período:</span>
                  <span className="text-xs font-mono bg-card border border-border rounded-full px-2.5 py-0.5 text-muted-foreground">
                    {periodLabel}
                  </span>
                  {relatorio.filtrosAplicados.stacks
                    .filter((s) => s !== "Todas")
                    .map((s) => (
                      <span
                        key={s}
                        className="text-xs font-mono bg-transparent border border-border text-muted-foreground rounded-full px-2.5 py-0.5"
                      >
                        {s}
                      </span>
                    ))}
                  {relatorio.filtrosAplicados.senioridades
                    .filter((s) => s !== "Todas")
                    .map((s) => (
                      <span
                        key={s}
                        className="text-xs font-mono bg-transparent border border-border text-muted-foreground rounded-full px-2.5 py-0.5"
                      >
                        {s}
                      </span>
                    ))}
                </div>

                {/* Cards de resumo */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    label="total de visualizações"
                    value={relatorio.resumo.totalCandidaturas}
                    sub="vagas clicadas no período"
                    icon={FileText}
                  />
                  <StatCard
                    label="fonte principal"
                    value={topFonte?.name ?? "—"}
                    sub={topFonte ? `${topFonte.value} vagas` : undefined}
                    icon={Building2}
                  />
                  <StatCard
                    label="senioridade top"
                    value={topSenioridade?.name ?? "—"}
                    sub={topSenioridade ? `${topSenioridade.value} vagas` : "sem dados suficientes"}
                    icon={TrendingUp}
                  />
                  <StatCard
                    label="tecnologia top"
                    value={topStack?.name ?? "—"}
                    sub={topStack ? `${topStack.value} vagas` : undefined}
                    icon={Layers}
                  />
                </div>

                {relatorio.resumo.totalCandidaturas > 0 ? (
                  <>
                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

                      {/* Visualizações por Mês — always shown; empty state inside */}
                      <ChartCard title="visualizações por mês">
                        {porMesData.length === 0 ? <ChartEmpty /> : (
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                              data={porMesData}
                              margin={{ top: 0, right: 4, left: -20, bottom: 0 }}
                              barCategoryGap="40%"
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }} allowDecimals={false} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="value" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} maxBarSize={48} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </ChartCard>

                      {/* Por Dia da Semana */}
                      <ChartCard title="por dia da semana">
                        {porDiaData.length === 0 ? <ChartEmpty /> : (
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={porDiaData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }} allowDecimals={false} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="value" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </ChartCard>

                      {/* Vagas por Fonte — ranked: top bar full indigo, rest muted */}
                      {porFonteData.length > 0 && (
                        <ChartCard title="vagas por fonte">
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={porFonteData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }} allowDecimals={false} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="value" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartCard>
                      )}

                      {/* Por Senioridade — single color */}
                      {porSenioridadeData.length > 0 && (
                        <ChartCard title="por senioridade">
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={porSenioridadeData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }} allowDecimals={false} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="value" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartCard>
                      )}
                    </div>

                    {/* Top Tecnologias — ranked horizontal */}
                    {porStackData.length > 0 && (
                      <div className="mb-6">
                        <ChartCard title={`top ${porStackData.length} tecnologias`}>
                          <ResponsiveContainer width="100%" height={porStackData.length * 38 + 16}>
                            <BarChart
                              data={porStackData}
                              layout="vertical"
                              margin={{ top: 0, right: 30, left: 4, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }} allowDecimals={false} axisLine={false} tickLine={false} />
                              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "JetBrains Mono" }} width={90} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="value" fill={CHART_PRIMARY} radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartCard>
                      </div>
                    )}

                    {/* Tabela de vagas visualizadas */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-display font-medium text-foreground text-sm sm:text-base">
                          vagas visualizadas
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground bg-secondary rounded-full px-2.5 py-0.5">
                          {relatorio.candidaturas.length} registro{relatorio.candidaturas.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-secondary/40 border-b border-border">
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                                data
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                                vaga
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                                senioridade
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                                tecnologias
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                                fonte
                              </th>
                              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">
                                link
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {paginatedCandidaturas.map((c, i) => (
                              <tr
                                key={`${c.vagaId}-${i}`}
                                className="hover:bg-secondary/30 transition-colors"
                              >
                                <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                                  {formatDateTime(c.dataInteracao)}
                                </td>
                                <td className="px-4 py-3 font-medium text-foreground max-w-[220px] truncate">
                                  {formatTitle(c.titulo)}
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell">
                                  {c.senioridade ? (
                                    <span className="text-xs font-mono bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 whitespace-nowrap">
                                      {SENIORIDADE_DISPLAY[c.senioridade]}
                                    </span>
                                  ) : (
                                    <span className="text-xs font-mono text-muted-foreground">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 hidden lg:table-cell">
                                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {c.stacks.slice(0, 3).map((s) => (
                                      <span
                                        key={s}
                                        className="text-xs font-mono bg-transparent border border-border text-muted-foreground rounded-full px-2 py-0.5"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                    {c.stacks.length > 3 && (
                                      <span className="text-xs font-mono text-muted-foreground/70 self-center">
                                        +{c.stacks.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell text-xs font-mono text-muted-foreground whitespace-nowrap">
                                  {c.fonte}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <a
                                    href={c.linkOriginal}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                    title="Abrir vaga"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {totalPages > 1 && (
                        <div className="px-4 sm:px-6 py-4 border-t border-border flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Página {page} de {totalPages} · {relatorio.candidaturas.length} registros
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={page === 1}
                              className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/70 rounded-lg disabled:opacity-40 transition-colors font-medium"
                            >
                              anterior
                            </button>
                            <button
                              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                              disabled={page === totalPages}
                              className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/70 rounded-lg disabled:opacity-40 transition-colors font-medium"
                            >
                              próxima
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-card border border-border rounded-xl py-20 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                    <p className="text-foreground font-medium mb-1">nenhuma vaga encontrada</p>
                    <p className="text-muted-foreground text-sm">
                      Ajuste os filtros ou clique em vagas para que elas apareçam aqui.
                    </p>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
