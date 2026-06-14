import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Code2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import type { Senioridade } from "@/types";

const SENIORIDADE_OPTIONS: { value: Senioridade; label: string }[] = [
  { value: "ESTAGIARIO", label: "Estágio" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    senioridadeAlvo: "" as Senioridade | "",
  });

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
    setIsLogin(!isLogin);
    setError(null);
    setFormData({ email: "", password: "", name: "", senioridadeAlvo: "" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back link */}
      <div className="px-6 pt-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 justify-center mb-8">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-semibold text-foreground">SearchJobs</span>
          </div>

          <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
            </h2>
            <p className="text-muted-foreground mb-6">
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
                  <label htmlFor="name" className="block mb-2 text-sm font-medium">
                    Nome completo
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    placeholder="Seu nome"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="••••••••"
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="senioridadeAlvo" className="block mb-2 text-sm font-medium">
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
                {isSubmitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={switchMode}
                className="text-sm text-muted-foreground"
              >
                {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
                <span className="text-primary hover:text-primary/80 font-medium transition-colors">
                  {isLogin ? "Criar conta" : "Fazer login"}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
