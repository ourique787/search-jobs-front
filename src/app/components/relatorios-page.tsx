import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  TrendingUp,
  Building2,
  Code2,
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
  Cell,
} from "recharts";
import { Header } from "./header";
import { api } from "@/services/api";
import { SENIORIDADE_DISPLAY } from "@/types";
import type { RelatorioDTO, Senioridade, Stack } from "@/types";

// ── Constantes ──────────────────────────────────────────────────────────────

const SENIORITY_OPTIONS: { value: Senioridade; label: string }[] = [
  { value: "ESTAGIARIO", label: "Estágio" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
  { value: "NAO_INFORMADO", label: "Não Informado" },
];

const CHART_COLORS = [
  "#4F46E5",
  "#7C3AED",
  "#059669",
  "#2563EB",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#9333EA",
];

const DIA_ABBR: Record<string, string> = {
  SEGUNDA: "Seg",
  TERÇA: "Ter",
  QUARTA: "Qua",
  QUINTA: "Qui",
  SEXTA: "Sex",
  SÁBADO: "Sáb",
  DOMINGO: "Dom",
};

const ITEMS_PER_PAGE = 10;

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
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function topEntries(
  map: Record<string, number>,
  n = 8
): { name: string; value: number }[] {
  return Object.entries(map)
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
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
        >
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      </div>
      <div>
        <p
          className="text-2xl font-bold text-foreground truncate"
          title={String(value)}
        >
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
        <p className="text-sm font-semibold text-foreground">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-5">{title}</h3>
      {children}
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
      setError(
        err instanceof Error ? err.message : "Erro ao gerar relatório."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleGerar() {
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
  }

  function setPreset(days: number | null) {
    if (days === null) {
      setDataInicio("");
      setDataFim("");
      return;
    }
    const fim = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - days);
    setDataFim(fim.toISOString().slice(0, 10));
    setDataInicio(inicio.toISOString().slice(0, 10));
  }

  const filteredStacks = stacks.filter((s) =>
    s.nome.toLowerCase().includes(stackSearch.toLowerCase())
  );

  const hasFilters =
    !!dataInicio ||
    !!dataFim ||
    selectedSeniorities.length > 0 ||
    selectedStackIds.length > 0;

  // Dados dos gráficos
  const porMesData =
    relatorio
      ? Object.entries(relatorio.resumo.distribuicaoTemporal.porMes).map(
          ([k, v]) => ({ name: formatMonth(k), value: v })
        )
      : [];

  const porDiaData =
    relatorio
      ? Object.entries(relatorio.resumo.distribuicaoTemporal.porDiaDaSemana).map(
          ([k, v]) => ({ name: DIA_ABBR[k] ?? k, value: v })
        )
      : [];

  const porStackData = relatorio ? topEntries(relatorio.resumo.porStack) : [];
  const porFonteData = relatorio ? topEntries(relatorio.resumo.porFonte) : [];

  const porSenioridadeData = relatorio
    ? Object.entries(relatorio.resumo.porSenioridade).map(([k, v]) => ({
        name: SENIORIDADE_DISPLAY[k as Senioridade] ?? k,
        value: v as number,
      }))
    : [];

  const topFonte = porFonteData[0];
  const topSenioridade = [...porSenioridadeData].sort(
    (a, b) => b.value - a.value
  )[0];
  const topStack = porStackData[0];

  // Paginação
  const paginatedCandidaturas =
    relatorio?.candidaturas.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    ) ?? [];
  const totalPages = Math.ceil(
    (relatorio?.candidaturas.length ?? 0) / ITEMS_PER_PAGE
  );

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
          {showFilters ? "Fechar Filtros" : "Abrir Filtros"}
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar de Filtros ─────────────────────────────────────────── */}
          <div
            className={`lg:flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <aside className="w-full lg:w-72 bg-card border border-border rounded-xl p-4 sm:p-6 h-fit sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <BarChart2 className="w-4 h-4 text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  Filtros do Relatório
                </h2>
              </div>

              {/* Atalhos de período */}
              <div className="mb-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Período Rápido
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Última semana", days: 7 },
                    { label: "Último mês", days: 30 },
                    { label: "3 meses", days: 90 },
                    { label: "Todo período", days: null },
                  ].map(({ label, days }) => (
                    <button
                      key={label}
                      onClick={() => setPreset(days)}
                      className="text-xs px-2 py-1.5 bg-secondary hover:bg-accent/20 hover:text-primary border border-border rounded-lg transition-colors text-left"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intervalo de datas */}
              <div className="mb-5">
                <p className="text-xs sm:text-sm font-medium text-foreground mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Intervalo de Datas
                </p>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground">De</label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-input-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Até</label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-input-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Senioridade */}
              <div className="mb-5">
                <p className="text-xs sm:text-sm font-medium text-foreground mb-3">
                  Senioridade
                </p>
                <div className="space-y-2">
                  {SENIORITY_OPTIONS.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
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
                <p className="text-xs sm:text-sm font-medium text-foreground mb-3">
                  Tecnologias
                </p>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={stackSearch}
                    onChange={(e) => setStackSearch(e.target.value)}
                    placeholder="Buscar tecnologia..."
                    className="w-full pl-9 pr-3 py-2 bg-input-background border border-input rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {filteredStacks.map((stack) => (
                    <label
                      key={stack.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStackIds.includes(stack.id)}
                        onChange={() =>
                          setSelectedStackIds((prev) =>
                            prev.includes(stack.id)
                              ? prev.filter((id) => id !== stack.id)
                              : [...prev, stack.id]
                          )
                        }
                        className="w-4 h-4 rounded border-border accent-[#6366F1]"
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

              {/* Ações */}
              <button
                onClick={handleGerar}
                disabled={isLoading}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mb-2 shadow-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Gerar Relatório
              </button>

              {hasFilters && (
                <button
                  onClick={handleLimpar}
                  className="w-full py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl text-sm font-medium transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </aside>
          </div>

          {/* ── Conteúdo principal ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                Relatórios
              </h1>
              <p className="text-sm text-muted-foreground">
                {relatorio && !isLoading
                  ? `Gerado em ${formatDateTime(relatorio.geradoEm)} · ${relatorio.resumo.totalCandidaturas} registro${relatorio.resumo.totalCandidaturas !== 1 ? "s" : ""}`
                  : "Visualize suas vagas clicadas com filtros personalizados."}
              </p>
            </div>

            {/* Carregando */}
            {isLoading && (
              <div className="flex justify-center py-24">
                <div className="w-9 h-9 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Erro */}
            {error && !isLoading && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <p className="text-destructive font-medium mb-1">{error}</p>
                <p className="text-muted-foreground text-sm">
                  Verifique se o backend está em execução e tente novamente.
                </p>
              </div>
            )}

            {/* Relatório */}
            {relatorio && !isLoading && (
              <>
                {/* Banner de filtros aplicados */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-6 flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-semibold text-primary">
                    Filtros:
                  </span>
                  <span className="text-xs bg-card border border-border rounded-full px-2.5 py-0.5 text-muted-foreground">
                    {relatorio.filtrosAplicados.dataInicio} →{" "}
                    {relatorio.filtrosAplicados.dataFim}
                  </span>
                  {relatorio.filtrosAplicados.stacks
                    .filter((s) => s !== "Todas")
                    .map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-accent/20 text-primary rounded-full px-2.5 py-0.5"
                      >
                        {s}
                      </span>
                    ))}
                  {relatorio.filtrosAplicados.senioridades
                    .filter((s) => s !== "Todas")
                    .map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-accent/20 text-primary rounded-full px-2.5 py-0.5"
                      >
                        {s}
                      </span>
                    ))}
                </div>

                {/* Cards de resumo */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    label="Total de Visualizações"
                    value={relatorio.resumo.totalCandidaturas}
                    sub="vagas clicadas no período"
                    icon={FileText}
                    accent
                  />
                  <StatCard
                    label="Fonte Principal"
                    value={topFonte?.name ?? "—"}
                    sub={topFonte ? `${topFonte.value} vagas` : undefined}
                    icon={Building2}
                  />
                  <StatCard
                    label="Senioridade Top"
                    value={topSenioridade?.name ?? "—"}
                    sub={
                      topSenioridade
                        ? `${topSenioridade.value} vagas`
                        : undefined
                    }
                    icon={TrendingUp}
                  />
                  <StatCard
                    label="Tecnologia Top"
                    value={topStack?.name ?? "—"}
                    sub={topStack ? `${topStack.value} vagas` : undefined}
                    icon={Code2}
                  />
                </div>

                {relatorio.resumo.totalCandidaturas > 0 ? (
                  <>
                    {/* Gráficos - grade 2 colunas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                      {/* Por mês */}
                      {porMesData.length > 0 && (
                        <ChartCard title="Visualizações por Mês">
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                              data={porMesData}
                              margin={{ top: 0, right: 4, left: -20, bottom: 0 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar
                                dataKey="value"
                                fill="var(--primary)"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartCard>
                      )}

                      {/* Por dia da semana */}
                      <ChartCard title="Por Dia da Semana">
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart
                            data={porDiaData}
                            margin={{ top: 0, right: 4, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--border)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                              allowDecimals={false}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                              dataKey="value"
                              fill="var(--chart-2)"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartCard>

                      {/* Por fonte */}
                      {porFonteData.length > 0 && (
                        <ChartCard title="Vagas por Fonte">
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                              data={porFonteData}
                              margin={{ top: 0, right: 4, left: -20, bottom: 0 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {porFonteData.map((_, i) => (
                                  <Cell
                                    key={i}
                                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartCard>
                      )}

                      {/* Por senioridade */}
                      {porSenioridadeData.length > 0 && (
                        <ChartCard title="Por Senioridade">
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                              data={porSenioridadeData}
                              margin={{ top: 0, right: 4, left: -20, bottom: 0 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {porSenioridadeData.map((_, i) => (
                                  <Cell
                                    key={i}
                                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartCard>
                      )}
                    </div>

                    {/* Top Tecnologias — gráfico horizontal */}
                    {porStackData.length > 0 && (
                      <div className="mb-6">
                        <ChartCard
                          title={`Top ${porStackData.length} Tecnologias`}
                        >
                          <ResponsiveContainer
                            width="100%"
                            height={porStackData.length * 38 + 16}
                          >
                            <BarChart
                              data={porStackData}
                              layout="vertical"
                              margin={{ top: 0, right: 30, left: 4, bottom: 0 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                                horizontal={false}
                              />
                              <XAxis
                                type="number"
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                width={90}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {porStackData.map((_, i) => (
                                  <Cell
                                    key={i}
                                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartCard>
                      </div>
                    )}

                    {/* Tabela de candidaturas */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base">
                          Vagas Visualizadas
                        </h3>
                        <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2.5 py-0.5">
                          {relatorio.candidaturas.length} registro
                          {relatorio.candidaturas.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-secondary/40 border-b border-border">
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                                Data
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                                Vaga
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                                Empresa
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                                Senioridade
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                                Tecnologias
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                                Fonte
                              </th>
                              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">
                                Link
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {paginatedCandidaturas.map((c, i) => (
                              <tr
                                key={`${c.vagaId}-${i}`}
                                className="hover:bg-secondary/30 transition-colors"
                              >
                                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDateTime(c.dataInteracao)}
                                </td>
                                <td className="px-4 py-3 font-medium text-foreground max-w-[180px] truncate">
                                  {c.titulo}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground text-sm hidden sm:table-cell max-w-[140px] truncate">
                                  {c.empresa}
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell">
                                  <span className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-0.5 whitespace-nowrap">
                                    {c.senioridade
                                      ? SENIORIDADE_DISPLAY[c.senioridade]
                                      : "—"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 hidden lg:table-cell">
                                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {c.stacks.slice(0, 3).map((s) => (
                                      <span
                                        key={s}
                                        className="text-xs bg-accent/20 text-primary rounded-full px-2 py-0.5"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                    {c.stacks.length > 3 && (
                                      <span className="text-xs text-muted-foreground self-center">
                                        +{c.stacks.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground whitespace-nowrap">
                                  {c.fonte}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <a
                                    href={c.linkOriginal}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-accent/20 text-primary transition-colors"
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

                      {/* Paginação */}
                      {totalPages > 1 && (
                        <div className="px-4 sm:px-6 py-4 border-t border-border flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Página {page} de {totalPages} ·{" "}
                            {relatorio.candidaturas.length} registros
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={page === 1}
                              className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/70 rounded-lg disabled:opacity-40 transition-colors font-medium"
                            >
                              Anterior
                            </button>
                            <button
                              onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                              }
                              disabled={page === totalPages}
                              className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/70 rounded-lg disabled:opacity-40 transition-colors font-medium"
                            >
                              Próxima
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Estado vazio */
                  <div className="bg-card border border-border rounded-xl py-20 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                    <p className="text-foreground font-medium mb-1">
                      Nenhuma vaga encontrada
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Ajuste os filtros ou clique em vagas para que elas apareçam
                      aqui.
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
