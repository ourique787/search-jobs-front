import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, ChevronLeft } from "lucide-react";
import { Header } from "./header";
import { FilterSidebar } from "./filter-sidebar";
import { JobCard } from "./job-card";
import { JobDetailPanel } from "./job-detail-panel";
import { api } from "@/services/api";
import { SENIORIDADE_DISPLAY } from "@/types";
import type { Job, Stack } from "@/types";

const MOBILE_SENIORITIES = ["Estágio", "Júnior", "Pleno", "Sênior"];

export function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeniorities, setSelectedSeniorities] = useState<string[]>([]);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [techSearch, setTechSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [jobsData, stacksData] = await Promise.all([
          api.jobs.list(),
          api.stacks.list(),
        ]);
        if (!cancelled) {
          setJobs(jobsData);
          setStacks(stacksData);
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError(
            err instanceof Error ? err.message : "Erro ao carregar dados."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSeniorityChange = (seniority: string) => {
    setSelectedSeniorities((prev) =>
      prev.includes(seniority)
        ? prev.filter((s) => s !== seniority)
        : [...prev, seniority]
    );
  };

  const handleTechChange = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const techNames = job.stacksRequisitadas.map((s) => s.nome);
      const seniorityDisplay = SENIORIDADE_DISPLAY[job.senioridade];

      const matchesSearch =
        searchQuery === "" ||
        job.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.empresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        techNames.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesSeniority =
        selectedSeniorities.length === 0 ||
        selectedSeniorities.includes(seniorityDisplay);

      const matchesTech =
        selectedTechs.length === 0 ||
        techNames.some((t) => selectedTechs.includes(t));

      return matchesSearch && matchesSeniority && matchesTech;
    });
  }, [jobs, searchQuery, selectedSeniorities, selectedTechs]);

  function handleJobClick(job: Job) {
    setSelectedJob(job);
    setShowMobileDetail(true);
    setShowMobileFilters(false);
  }

  const activeFilterCount = selectedSeniorities.length + selectedTechs.length;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden max-w-[1600px] mx-auto w-full pl-4 sm:pl-6 pr-4 sm:pr-6">

        {/* ── Sidebar de filtros — desktop only ───────────────────────── */}
        <FilterSidebar
          stacks={stacks}
          selectedSeniorities={selectedSeniorities}
          selectedTechs={selectedTechs}
          onSeniorityChange={handleSeniorityChange}
          onTechChange={handleTechChange}
          techSearch={techSearch}
          onTechSearchChange={setTechSearch}
        />

        {/* ── Painel da lista de vagas ─────────────────────────────────── */}
        <div
          className={`flex flex-col w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 border-r border-border ml-4 sm:ml-6 ${
            showMobileDetail ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Cabeçalho do painel */}
          <div className="flex-shrink-0 bg-card border-b border-border p-3 sm:p-4 space-y-3">
            {/* Botão de filtro mobile */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden w-full px-3 py-2 bg-secondary border border-border rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-secondary/70 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="ml-auto bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Painel de filtros mobile inline */}
            {showMobileFilters && (
              <div className="lg:hidden border border-border rounded-xl p-3 bg-secondary/30 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Senioridade
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOBILE_SENIORITIES.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSeniorityChange(s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          selectedSeniorities.includes(s)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-foreground hover:border-primary/50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setSelectedSeniorities([]);
                      setSelectedTechs([]);
                    }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Limpar filtros ({activeFilterCount})
                  </button>
                )}
              </div>
            )}

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar vagas, empresas, tecnologias..."
                className="w-full pl-9 pr-4 py-2.5 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "Carregando..."
                : `${filteredJobs.length} vaga${filteredJobs.length !== 1 ? "s" : ""} encontrada${filteredJobs.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Lista de vagas */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {fetchError && !isLoading && (
              <div className="p-6 text-center">
                <p className="text-destructive text-sm font-medium">{fetchError}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Verifique se o backend está em execução.
                </p>
              </div>
            )}

            {!isLoading && !fetchError && (
              <>
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={selectedJob?.id === job.id}
                    onClick={() => handleJobClick(job)}
                  />
                ))}
                {filteredJobs.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground text-sm font-medium">
                      Nenhuma vaga encontrada
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Tente outros filtros ou termos de busca.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Painel de detalhe ────────────────────────────────────────── */}
        <div
          className={`flex-1 overflow-hidden flex flex-col ${
            showMobileDetail ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Botão de voltar (mobile) */}
          {showMobileDetail && (
            <button
              onClick={() => setShowMobileDetail(false)}
              className="lg:hidden flex-shrink-0 px-4 py-3 bg-card border-b border-border flex items-center gap-2 text-sm text-primary font-medium hover:bg-secondary/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar para vagas
            </button>
          )}
          <JobDetailPanel job={selectedJob} allJobs={jobs} />
        </div>

        </div>{/* max-w container */}
      </div>
    </div>
  );
}
