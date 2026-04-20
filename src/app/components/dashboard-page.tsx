import { useState, useEffect, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { Header } from "./header";
import { FilterSidebar } from "./filter-sidebar";
import { JobCard } from "./job-card";
import { TrendingWidget } from "./trending-widget";
import { RobotStatusWidget } from "./robot-status-widget";
import { api } from "@/services/api";
import { SENIORIDADE_DISPLAY } from "@/types";
import type { Job, Stack } from "@/types";

function formatDataColeta(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours} hora${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `Há ${days} dia${days > 1 ? "s" : ""}`;
}

export function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeniorities, setSelectedSeniorities] = useState<string[]>([]);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [techSearch, setTechSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden mb-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? "Fechar Filtros" : "Abrir Filtros"}
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <div
            className={`lg:flex-shrink-0 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <FilterSidebar
              stacks={stacks}
              selectedSeniorities={selectedSeniorities}
              selectedTechs={selectedTechs}
              onSeniorityChange={handleSeniorityChange}
              onTechChange={handleTechChange}
              techSearch={techSearch}
              onTechSearchChange={setTechSearch}
            />
          </div>

          {/* Main Content - Job Feed */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Últimas Vagas Encontradas
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {isLoading
                  ? "Carregando..."
                  : `${filteredJobs.length} vaga${filteredJobs.length !== 1 ? "s" : ""} disponível${filteredJobs.length !== 1 ? "is" : ""}`}
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por vaga, empresa ou tecnologia..."
                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow shadow-sm text-sm sm:text-base"
              />
            </div>

            {/* States */}
            {isLoading && (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {fetchError && !isLoading && (
              <div className="text-center py-16">
                <p className="text-destructive text-base">{fetchError}</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Verifique se o backend está em execução e tente novamente.
                </p>
              </div>
            )}

            {/* Job Cards */}
            {!isLoading && !fetchError && (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={String(job.id)}
                    title={job.titulo}
                    company={job.empresa}
                    source={job.fonte}
                    technologies={job.stacksRequisitadas.map((s) => s.nome)}
                    seniority={SENIORIDADE_DISPLAY[job.senioridade]}
                    collectedAt={formatDataColeta(job.dataColeta)}
                    linkOriginal={job.linkOriginal}
                  />
                ))}

                {filteredJobs.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-base sm:text-lg">
                      Nenhuma vaga encontrada com os filtros selecionados.
                    </p>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-2">
                      Tente ajustar os filtros ou limpar a busca.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Widgets */}
          <div className="lg:flex-shrink-0 w-full lg:w-80">
            <div className="sticky top-24 space-y-4">
              <TrendingWidget jobs={jobs} />
              <RobotStatusWidget jobCount={jobs.length} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
