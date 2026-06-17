import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Code2, Check } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import type { Senioridade } from "@/types";

const SENIORIDADE_OPTIONS: { value: Senioridade; label: string }[] = [
  { value: "ESTAGIARIO", label: "Estágio" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
];

const VALUE_POINTS = [
  "Junta as vagas de InfoJobs e Empregos.com.br num feed só.",
  "Remove duplicatas e filtra pelo seu perfil — stack e senioridade.",
  "Mostra de onde veio cada vaga e o quanto ela combina com você.",
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    senioridadeAlvo: "" as Senioridade | "",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login({ email: formData.email, senha: formData.password });
      } else {
        if (!formData.name.trim()) {
          setError("Informe seu nome.");
          setIsSubmitting(false);
          return;
        }
        await register({
          nome: formData.name.trim(),
          email: formData.email,
          senha: formData.password,
          senioridadeAlvo: formData.senioridadeAlvo || undefined,
        });
      }
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (isLogin && (msg.includes("401") || msg.includes("Unauthorized"))) {
        setError("Email ou senha inválidos.");
      } else if (msg.includes("400") || msg.includes("Email já cadastrado")) {
        setError("Este email já está cadastrado. Faça login.");
      } else {
        setError(msg || "Ocorreu um erro. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsLogin((prev) => !prev);
    setError(null);
    setFormData({ email: "", password: "", name: "", senioridadeAlvo: "" });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Coluna esquerda — marca e valor ─────────────────────────────── */}
      <div className="bg-primary flex flex-col px-8 py-10 lg:flex-1 lg:px-14 lg:justify-center">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-white">SearchJobs</span>
        </div>

        <h1 className="text-3xl lg:text-[2.6rem] font-display font-bold text-white leading-[1.1] mb-3">
          vagas de tech,<br />sem ruído.
        </h1>
        <p className="text-white/55 text-sm mb-8 leading-relaxed max-w-[22rem]">
          Tudo que você precisa para encontrar a próxima oportunidade — num lugar só.
        </p>

        <ul className="flex flex-col gap-3.5">
          {VALUE_POINTS.map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </span>
              <span className="text-sm text-white/75 leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Coluna direita — formulário ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[400px]"
        >
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {isLogin
              ? "Entre para continuar sua busca"
              : "Comece a encontrar vagas incríveis"}
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block mb-1.5 text-sm font-medium text-foreground">
                  Nome completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="Seu nome"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-foreground">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="senioridadeAlvo" className="block mb-1.5 text-sm font-medium text-foreground">
                  Senioridade alvo{" "}
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <select
                  id="senioridadeAlvo"
                  name="senioridadeAlvo"
                  value={formData.senioridadeAlvo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-shadow text-sm"
                >
                  <option value="">Selecione...</option>
                  {SENIORIDADE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent hover:bg-accent/90 disabled:opacity-60 text-accent-foreground py-3 rounded-xl transition-colors font-medium shadow-sm mt-2"
            >
              {isSubmitting ? "aguarde..." : isLogin ? "entrar" : "criar conta"}
            </button>
          </form>

          {/* Link de alternância */}
          <p className="text-sm text-muted-foreground text-center mt-5">
            {isLogin ? "não tem conta? " : "já tem conta? "}
            <button
              type="button"
              onClick={switchMode}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {isLogin ? "criar conta" : "entrar"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
