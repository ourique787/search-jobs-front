import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, ChevronLeft } from "lucide-react";
import { Header } from "./header";
import { JobCard } from "./job-card";
import { JobDetailPanel } from "./job-detail-panel";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { SENIORIDADE_DISPLAY } from "@/types";
import type { Job, Stack } from "@/types";

function matchScore(job: Job, prefs: { senioridadeAlvo: string; preferredStacks: string[] }): number {
  const hasSeniorityPref = !!prefs.senioridadeAlvo;
  const hasStackPref = prefs.preferredStacks.length > 0;
  const names = job.stacksRequisitadas.map((s) => s.nome);
  const seniorityOk = !hasSeniorityPref || job.senioridade === prefs.senioridadeAlvo;
  const stackOk = !hasStackPref || prefs.preferredStacks.some((s) => names.includes(s));
  if (!seniorityOk || !stackOk) return 0;
  let score = 0;
  if (hasSeniorityPref) score += 2;
  score += prefs.preferredStacks.filter((s) => names.includes(s)).length;
  return score;
}

const SENIORITY_OPTIONS = ["Estágio", "Júnior", "Pleno", "Sênior"];

export function DashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeniorities, setSelectedSeniorities] = useState<string[]>([]);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [techSearch, setTechSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [jobsData, stacksData] = await Promise.all([api.jobs.list(), api.stacks.list()]);
        if (!cancelled) { setJobs(jobsData); setStacks(stacksData); }
      } catch (err) {
        if (!cancelled) setFetchError(err instanceof Error ? err.message : "Erro ao carregar dados.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const prefs = useMemo(() => ({
    senioridadeAlvo: user?.senioridadeAlvo ?? "",
    preferredStacks: user?.stacksPreferidas?.map((s) => s.nome) ?? [],
  }), [user?.senioridadeAlvo, user?.stacksPreferidas]);

  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      const techNames = job.stacksRequisitadas.map((s) => s.nome);
      const seniorityDisplay = SENIORIDADE_DISPLAY[job.senioridade];
      const matchesSearch =
        searchQuery === "" ||
        job.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.empresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        techNames.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSeniority = selectedSeniorities.length === 0 || selectedSeniorities.includes(seniorityDisplay);
      const matchesTech = selectedTechs.length === 0 || techNames.some((t) => selectedTechs.includes(t));
      return matchesSearch && matchesSeniority && matchesTech;
    });
    const hasPrefs = prefs.senioridadeAlvo || prefs.preferredStacks.length > 0;
    if (!hasPrefs) return filtered;
    return [...filtered].sort((a, b) => matchScore(b, prefs) - matchScore(a, prefs));
  }, [jobs, searchQuery, selectedSeniorities, selectedTechs, prefs]);

  const { matchJobs, otherJobs } = useMemo(() => {
    const hasPrefs = !!(prefs.senioridadeAlvo || prefs.preferredStacks.length > 0);
    if (!hasPrefs) return { matchJobs: [] as Job[], otherJobs: filteredJobs };
    return {
      matchJobs: filteredJobs.filter((j) => matchScore(j, prefs) > 0),
      otherJobs: filteredJobs.filter((j) => matchScore(j, prefs) === 0),
    };
  }, [filteredJobs, prefs]);

  function handleJobClick(job: Job) {
    setSelectedJob(job);
    setShowMobileDetail(true);
  }

  const toggleSeniority = (s: string) =>
    setSelectedSeniorities((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const toggleTech = (t: string) =>
    setSelectedTechs((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const activeFilterCount = selectedSeniorities.length + selectedTechs.length;
  const filteredStackOptions = stacks.filter((s) =>
    s.nome.toLowerCase().includes(techSearch.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden max-w-[1600px] mx-auto w-full pl-4 sm:pl-6 pr-4 sm:pr-6">

          {/* ── Painel da lista de vagas ── */}
          <div className={`flex flex-col w-full lg:w-[400px] xl:w-[440px] flex-shrink-0 border-r border-border ${
            showMobileDetail ? "hidden lg:flex" : "flex"
          }`}>
            {/* Header: busca + filtros */}
            <div className="relative flex-shrink-0">
              <div className="bg-card border-b border-border p-3 sm:p-4 space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cargo, empresa ou tecnologia..."
                      className="w-full pl-9 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters((p) => !p)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      showFilters || activeFilterCount > 0
                        ? "bg-accent/10 border-accent/40 text-primary"
                        : "bg-secondary border-border text-foreground hover:border-accent/40"
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filtros</span>
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  {isLoading
                    ? "Carregando..."
                    : `${filteredJobs.length} vaga${filteredJobs.length !== 1 ? "s" : ""} encontrada${filteredJobs.length !== 1 ? "s" : ""}`}
                </p>
              </div>

              {/* Painel de filtros — overlay flutuante, não desloca a lista */}
              {showFilters && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
                  <div className="absolute top-full left-0 right-0 z-20 bg-card border-x border-b border-border shadow-lg rounded-b-xl overflow-y-auto max-h-[60vh]">
                  <div className="p-4 space-y-4">
                    {/* Senioridade */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Senioridade
                        </p>
                        {selectedSeniorities.length > 0 && (
                          <button
                            onClick={() => setSelectedSeniorities([])}
                            className="text-xs text-primary hover:underline"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {SENIORITY_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => toggleSeniority(s)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                              selectedSeniorities.includes(s)
                                ? "bg-primary/10 text-primary border-primary/30"
                                : "bg-transparent border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tecnologias */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Tecnologias{selectedTechs.length > 0 && ` (${selectedTechs.length})`}
                        </p>
                        {selectedTechs.length > 0 && (
                          <button
                            onClick={() => setSelectedTechs([])}
                            className="text-xs text-primary hover:underline"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                      <div className="relative mb-2">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          value={techSearch}
                          onChange={(e) => setTechSearch(e.target.value)}
                          placeholder="Buscar tecnologia..."
                          className="w-full pl-8 pr-3 py-1.5 bg-secondary border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {filteredStackOptions.map((stack) => (
                          <button
                            key={stack.id}
                            onClick={() => toggleTech(stack.nome)}
                            className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors ${
                              selectedTechs.includes(stack.nome)
                                ? "bg-primary/10 text-primary border-primary/30"
                                : "bg-transparent border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}
                          >
                            {stack.nome}
                          </button>
                        ))}
                        {filteredStackOptions.length === 0 && (
                          <p className="text-xs text-muted-foreground">Nenhuma encontrada.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                </>
              )}
            </div>

            {/* Lista de vagas */}
            <div className="flex-1 overflow-y-auto">
              {isLoading && (
                <div className="flex justify-center py-16">
                  <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
              {!isLoading && !fetchError && filteredJobs.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground text-sm font-medium">Nenhuma vaga encontrada</p>
                  <p className="text-muted-foreground text-xs mt-1">Tente outros filtros ou termos de busca.</p>
                </div>
              )}

              {!isLoading && !fetchError && matchJobs.length > 0 && (
                <>
                  <div className="sticky top-0 z-10 px-4 py-2.5 bg-card border-b border-border">
                    <p className="text-[13px] font-medium text-muted-foreground">
                      Para você · {matchJobs.length} {matchJobs.length === 1 ? "vaga" : "vagas"}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                      Combinam com suas preferências
                    </p>
                  </div>
                  {matchJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSelected={selectedJob?.id === job.id}
                      onClick={() => handleJobClick(job)}
                    />
                  ))}
                </>
              )}

              {!isLoading && !fetchError && matchJobs.length > 0 && otherJobs.length > 0 && (
                <div className="sticky top-0 z-10 px-4 py-2.5 bg-card border-b border-t border-border mt-1">
                  <p className="text-[13px] font-medium text-muted-foreground">Outras vagas</p>
                </div>
              )}

              {!isLoading && !fetchError && otherJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSelected={selectedJob?.id === job.id}
                  onClick={() => handleJobClick(job)}
                />
              ))}
            </div>
          </div>

          {/* ── Painel de detalhe ── */}
          <div className={`flex-1 overflow-hidden flex flex-col ${
            showMobileDetail ? "flex" : "hidden lg:flex"
          }`}>
            {showMobileDetail && (
              <button
                onClick={() => setShowMobileDetail(false)}
                className="lg:hidden flex-shrink-0 px-4 py-3 bg-card border-b border-border flex items-center gap-2 text-sm text-primary font-medium hover:bg-secondary/50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar para vagas
              </button>
            )}
            <JobDetailPanel
              job={selectedJob}
              allJobs={jobs}
              onClose={() => { setSelectedJob(null); setShowMobileDetail(false); }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
