import { useState } from "react";
import { useNavigate } from "react-router";
import { Code2 } from "lucide-react";
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
    <div className="min-h-screen flex">
      {/* Left Column - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-lg rotate-12"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 border-2 border-white rounded-lg -rotate-6"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-white rounded-full"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-start px-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-semibold text-white">SearchJobs</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-bold text-white mb-4 leading-tight"
          >
            Encontre sua próxima<br />oportunidade tech
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-white/80 max-w-md"
          >
            Vagas atualizadas em tempo real das principais plataformas de
            recrutamento. Filtradas especialmente para profissionais de
            tecnologia.
          </motion.p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-semibold text-primary">SearchJobs</span>
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

            {/* Error Message */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Form */}
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
                  <label
                    htmlFor="senioridadeAlvo"
                    className="block mb-2 text-sm font-medium"
                  >
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
                {isSubmitting
                  ? "Aguarde..."
                  : isLogin
                  ? "Entrar"
                  : "Criar conta"}
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
