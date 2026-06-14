import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Code2, ArrowRight, ArrowDown, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { getToken } from "@/services/api";

// ── Conteúdo ──────────────────────────────────────────────────────────────────

const SOURCES = ["InfoJobs", "Empregos.com.br"];

const STEPS = [
  {
    title: "Coleta automática",
    text: "Robô visita o InfoJobs e o Empregos.com.br diariamente e salva as vagas de tecnologia.",
  },
  {
    title: "Busca centralizada",
    text: "Pesquise por cargo, empresa ou stack em um só lugar, sem entrar em cada site.",
  },
  {
    title: "Match com seu perfil",
    text: "Configure sua senioridade e stacks preferidas. As vagas que combinam aparecem primeiro.",
  },
  {
    title: "Candidate-se direto",
    text: "Um clique leva à vaga original, sem intermediários ou formulários extras.",
  },
];

// Caos: representam o "antes" — todos os sites que o usuário teria de abrir.
// top/left em px dentro de um container de 300px de altura; zigzag no eixo X
// evita o padrão diagonal uniforme e cria sensação de bagunça.
const CHAOS_CARDS = [
  { source: "InfoJobs",        title: "Dev. Java Pleno",       top: 66,  left: 0,  rot: -8 },
  { source: "Empregos.com.br", title: "Analista de Sistemas",  top: 87,  left: 14, rot: -2 },
  { source: "LinkedIn",        title: "Software Engineer",     top: 108, left: 3,  rot:  3 },
  { source: "Catho",           title: "Dev. Back-End Pleno",   top: 129, left: 18, rot:  7 },
  { source: "Glassdoor",       title: "Eng. de Software",      top: 150, left: 2,  rot: -5 },
  { source: "Vagas.com",       title: "Dev. Full Stack",        top: 171, left: 12, rot:  4 },
];

// ── Visual "dez abas → um feed" ───────────────────────────────────────────────

function TabbedHeroVisual() {
  return (
    <div
      className="flex items-center gap-4 w-full select-none"
      style={{ height: 300 }}
      aria-hidden="true"
    >
      {/* ── Pile de abas caóticas ── */}
      <div className="relative flex-shrink-0" style={{ width: 200, height: 300 }}>
        {CHAOS_CARDS.map((card, i) => (
          <div
            key={i}
            className="absolute bg-card border border-border rounded-xl shadow-sm p-3"
            style={{
              width: 170,
              top: card.top,
              left: card.left,
              transform: `rotate(${card.rot}deg)`,
              zIndex: CHAOS_CARDS.length - i,
              opacity: 0.88,
            }}
          >
            <p className="text-[9px] font-semibold text-primary/60 uppercase tracking-wider mb-0.5">
              {card.source}
            </p>
            <p className="text-[11px] font-semibold text-foreground/80 truncate">{card.title}</p>
          </div>
        ))}
      </div>

      {/* ── Seta de convergência ── */}
      <div className="flex-shrink-0 flex items-center gap-0.5">
        <div className="h-px w-6 bg-primary/30" />
        <ArrowRight className="w-5 h-5 text-primary/60" />
      </div>

      {/* ── Feed único, limpo ── */}
      <div className="flex-1 min-w-0">
        <div className="bg-card border-2 border-primary/25 rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              S
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate leading-tight">
                Stefanini
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">InfoJobs</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug mb-2.5">
            Dev. Back-End Java Pleno
          </p>
          <div className="flex flex-wrap gap-1 mb-2.5">
            <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
              Pleno
            </span>
            <span className="text-[10px] border border-border text-muted-foreground px-2 py-0.5 rounded-full">
              Java
            </span>
            <span className="text-[10px] border border-border text-muted-foreground px-2 py-0.5 rounded-full">
              Spring Boot
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            <Sparkles className="w-2.5 h-2.5" />
            Para você
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export function HomePage() {
  const [jobCount, setJobCount] = useState<number | null>(null);

  useEffect(() => {
    const base = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080";
    const token = getToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${base}/api/jobs`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((jobs) => {
        if (Array.isArray(jobs)) setJobCount(jobs.length);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Navbar ── */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">SearchJobs</span>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl text-sm font-medium transition-colors"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-16 items-center">
        {/* Esquerda */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Agregador de vagas tech
          </span>

          <h1 className="text-5xl lg:text-6xl font-black text-foreground leading-[1.05] mb-5">
            Pare de abrir<br />
            <span className="text-primary">dez abas.</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-5 max-w-md leading-relaxed">
            SearchJobs reúne vagas do InfoJobs e do Empregos.com.br num feed único — filtrado por senioridade e stack para combinar com o seu perfil.
          </p>

          {/* Fontes + contagem dinâmica */}
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {SOURCES.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 bg-secondary border border-border rounded-full text-xs font-medium text-foreground"
              >
                {s}
              </span>
            ))}
            {jobCount !== null && (
              <span className="text-sm text-muted-foreground">
                · {jobCount.toLocaleString("pt-BR")}+ vagas
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold transition-colors shadow-sm"
            >
              Começar agora
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/70 text-foreground rounded-xl font-semibold transition-colors border border-border"
            >
              Ver como funciona
            </a>
          </div>
        </motion.div>

        {/* Direita — "dez abas → um feed" */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="hidden lg:block"
        >
          <TabbedHeroVisual />
        </motion.div>
      </section>

      {/* ── Como funciona — fluxo numerado ── */}
      <section id="como-funciona" className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Como funciona</h2>
            <p className="text-muted-foreground max-w-lg">
              Do robô ao candidato, tudo automatizado para você focar no que importa.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.title}>
                <div className="flex-1 lg:pr-6">
                  <span className="block text-6xl font-black text-primary/20 leading-none mb-4 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <>
                    <div className="hidden lg:flex items-start justify-center pt-10 flex-shrink-0 px-1 text-border">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className="lg:hidden flex justify-start py-5 text-border">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  </>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fontes ── */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-sm font-medium text-muted-foreground mb-5">Vagas coletadas de</p>
          <div className="flex flex-wrap gap-3">
            {SOURCES.map((source) => (
              <span
                key={source}
                className="px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — bookend "nove abas" ── */}
      <section className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="bg-primary rounded-2xl overflow-hidden">
            <div className="p-10 lg:p-12 grid lg:grid-cols-[1fr_260px] gap-10 items-center">
              {/* Copy */}
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.05] mb-4">
                  Feche as outras<br />nove abas.
                </h2>
                <p className="text-white/70 mb-8 max-w-sm leading-relaxed">
                  Crie sua conta e deixe o SearchJobs agregar tudo num lugar só.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-colors"
                >
                  Criar conta grátis
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* A aba que sobra — o feed único */}
              <div className="hidden lg:block">
                <div className="bg-white/10 border border-white/15 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Code2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">SearchJobs</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      "Dev. Back-End Java Pleno",
                      "Analista de Sistemas Sênior",
                      "Software Engineer Pleno",
                    ].map((title, i) => (
                      <div key={i} className="bg-white/10 border border-white/10 rounded-lg px-3 py-2">
                        <p className="text-[11px] font-medium text-white/80 truncate">{title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Code2 className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-foreground">SearchJobs</span>
          </div>
          <p>© {new Date().getFullYear()} SearchJobs</p>
        </div>
      </footer>
    </div>
  );
}
