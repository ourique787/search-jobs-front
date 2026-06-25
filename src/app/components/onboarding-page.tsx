import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Code2, Search } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { SENIORIDADE_DISPLAY } from "@/types";
import type { Senioridade, Stack } from "@/types";

const SENIORIDADES: Senioridade[] = ["ESTAGIARIO", "JUNIOR", "PLENO", "SENIOR"];

const SENIORITY_HINTS: Record<Senioridade, string> = {
  ESTAGIARIO: "Aprendizado e primeiros projetos",
  JUNIOR: "Início da carreira profissional",
  PLENO: "Experiência consolidada",
  SENIOR: "Alta autonomia e liderança técnica",
  NAO_INFORMADO: "",
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [senioridade, setSenioridade] = useState<Senioridade | "">("");
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [selectedStackNames, setSelectedStackNames] = useState<string[]>([]);
  const [stackSearch, setStackSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.stacks.list().then(setStacks).catch(() => {});
  }, []);

  const filtered = stacks.filter((s) =>
    s.nome.toLowerCase().includes(stackSearch.toLowerCase())
  );

  const toggle = (nome: string) =>
    setSelectedStackNames((prev) =>
      prev.includes(nome) ? prev.filter((n) => n !== nome) : [...prev, nome]
    );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const stackIds = stacks
        .filter((s) => selectedStackNames.includes(s.nome))
        .map((s) => s.id);

      const response = await api.users.updateProfile({
        senioridadeAlvo: senioridade || null,
        stackIds,
      });

      updateUser({
        senioridadeAlvo: response.senioridadeAlvo ?? null,
        stacksPreferidas: response.stacksPreferidas ?? [],
      });
    } catch {
      // silencia — preferências são opcionais, não bloqueia
    } finally {
      navigate("/dashboard");
    }
  };

  const nomeDisplay = user?.nome?.split(" ")[0] ?? "por aqui";
  const hasSelections = senioridade || selectedStackNames.length > 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[480px]"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">SearchJobs</span>
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground mb-1">
          olá, {nomeDisplay}!
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Configure suas preferências para receber vagas personalizadas. Você pode alterar isso a qualquer momento no perfil.
        </p>

        {/* Senioridade */}
        <div className="mb-8">
          <p className="text-sm font-medium text-foreground mb-3">senioridade alvo</p>
          <div className="grid grid-cols-2 gap-2.5">
            {SENIORIDADES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSenioridade((prev) => (prev === s ? "" : s))}
                className={`px-4 py-3.5 rounded-xl border text-left transition-all ${
                  senioridade === s
                    ? "border-primary bg-primary/8 text-primary ring-1 ring-primary/30"
                    : "border-border bg-secondary text-muted-foreground hover:border-accent/50 hover:text-foreground"
                }`}
              >
                <span className="block font-mono font-medium text-sm">
                  {SENIORIDADE_DISPLAY[s]}
                </span>
                <span className="text-xs font-normal mt-0.5 opacity-70 leading-tight">
                  {SENIORITY_HINTS[s]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stacks */}
        {stacks.length > 0 && (
          <div className="mb-8">
            <p className="text-sm font-medium text-foreground mb-1">tecnologias de interesse</p>
            <p className="text-xs font-mono text-muted-foreground mb-3">
              {selectedStackNames.length > 0
                ? `${selectedStackNames.length} selecionada${selectedStackNames.length > 1 ? "s" : ""}`
                : "nenhuma selecionada"}
            </p>

            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={stackSearch}
                onChange={(e) => setStackSearch(e.target.value)}
                placeholder="buscar tecnologia..."
                className="w-full pl-8 pr-3 py-2 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 border border-border rounded-xl p-3 bg-secondary/30">
              {filtered.map((stack) => (
                <label key={stack.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedStackNames.includes(stack.nome)}
                    onChange={() => toggle(stack.nome)}
                    className="w-4 h-4 rounded border-border accent-[#6366F1]"
                  />
                  <span className="text-sm font-mono text-foreground group-hover:text-primary transition-colors">
                    {stack.nome}
                  </span>
                </label>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground py-1">nenhuma encontrada.</p>
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-60 text-accent-foreground py-3 rounded-xl font-medium transition-colors"
          >
            {isSaving ? "salvando..." : hasSelections ? "salvar e continuar" : "continuar"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-xs text-muted-foreground hover:text-primary transition-colors py-1"
          >
            pular por agora
          </button>
        </div>
      </motion.div>
    </div>
  );
}
