import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useGoogleLogin } from "@react-oauth/google";
import { Code2, Check, Eye, EyeOff, X, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import type { Senioridade, Stack } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import { cn } from "@/app/components/ui/utils";

// ── StacksMultiSelect ────────────────────────────────────────────────────────

interface StacksMultiSelectProps {
  stacks: Stack[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

function StacksMultiSelect({ stacks, selectedIds, onChange }: StacksMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedStacks = stacks.filter((s) => selectedIds.includes(s.id));

  const toggle = (id: number) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          tabIndex={0}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            "w-full min-h-[48px] px-3 py-2 bg-input-background border border-input rounded-xl text-sm cursor-pointer",
            "flex flex-wrap items-center gap-1.5",
            open ? "ring-2 ring-ring" : "focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {selectedStacks.length === 0 ? (
            <span className="text-muted-foreground px-1 flex-1">selecione...</span>
          ) : (
            selectedStacks.map((stack) => (
              <span
                key={stack.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono normal-case bg-primary/10 text-primary border border-primary/30"
              >
                {stack.nome}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remover ${stack.nome}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); toggle(stack.id); }}
                  className="hover:text-primary/60 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </span>
              </span>
            ))
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground ml-auto flex-shrink-0 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <CommandInput placeholder="buscar tecnologia..." />
          <CommandList className="max-h-48">
            <CommandEmpty className="text-xs py-4 text-center">
              nenhuma encontrada.
            </CommandEmpty>
            <CommandGroup>
              {stacks.map((stack) => {
                const selected = selectedIds.includes(stack.id);
                return (
                  <CommandItem
                    key={stack.id}
                    value={stack.nome}
                    onSelect={() => toggle(stack.id)}
                    className="cursor-pointer gap-2"
                  >
                    <Check
                      className={cn(
                        "w-3.5 h-3.5 flex-shrink-0 text-primary",
                        selected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-mono text-xs normal-case">{stack.nome}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── Constantes ───────────────────────────────────────────────────────────────

const SENIORIDADE_OPTIONS: { value: Senioridade; label: string }[] = [
  { value: "ESTAGIARIO", label: "Estágio" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
];

const VALUE_POINTS = [
  "Junta as vagas de diversos portais em um único feed.",
  "Remove duplicatas e filtra pelo seu perfil — stack e senioridade.",
  "Mostra de onde veio cada vaga e o quanto ela combina com você.",
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 flex-shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ── LoginPage ────────────────────────────────────────────────────────────────

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, googleLogin, updateUser, isAuthenticated, isLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    senioridadeAlvo: "" as Senioridade | "",
  });

  const [stacks, setStacks] = useState<Stack[]>([]);
  const [selectedStackIds, setSelectedStackIds] = useState<number[]>([]);

  useEffect(() => {
    api.stacks.list().then(setStacks).catch(() => {});
  }, []);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGooglePending(true);
      setError(null);
      try {
        await googleLogin(tokenResponse.access_token);
        navigate("/dashboard");
      } catch {
        setError("Falha ao entrar com Google. Tente novamente.");
        setGooglePending(false);
      }
    },
    onError: () => {
      setError("Falha ao entrar com Google. Tente novamente.");
    },
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
        // Usuário autenticado — persiste stacks e sincroniza o contexto
        if (selectedStackIds.length > 0) {
          try {
            const updated = await api.users.updateProfile({ stackIds: selectedStackIds });
            updateUser({ stacksPreferidas: updated.stacksPreferidas ?? [] });
          } catch {
            // Não-crítico: stacks podem ser configuradas no perfil depois
          }
        }
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
    setShowPassword(false);
    setGooglePending(false);
    setSelectedStackIds([]);
    setFormData({ email: "", password: "", name: "", senioridadeAlvo: "" });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Coluna esquerda ──────────────────────────────────────────────── */}
      <div className="bg-primary flex flex-col px-8 py-10 lg:flex-1 lg:px-14 lg:justify-center">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-white">SearchJobs</span>
        </div>

        <h1 className="text-3xl lg:text-[2.6rem] font-display font-bold text-white leading-[1.1] mb-3">
          vagas de tech,<br />sem perda de tempo.
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

      {/* ── Coluna direita ───────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[400px]"
        >
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">
            {isLogin ? "entrar na conta" : "criar conta"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {isLogin
              ? "acesse seu feed personalizado de vagas"
              : "comece a encontrar as melhores vagas para o seu perfil"}
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={() => { setError(null); handleGoogleLogin(); }}
            disabled={googlePending}
            className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 border rounded-xl text-sm transition-all ${
              googlePending
                ? "border-primary/30 bg-primary/5 text-primary cursor-default opacity-70"
                : "border-border bg-card hover:bg-secondary/50 text-foreground"
            }`}
          >
            <GoogleIcon />
            {googlePending ? "aguarde..." : "continuar com google"}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Nome — só no cadastro */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block mb-1.5 text-sm font-medium text-foreground">
                  nome completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="seu nome"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-foreground">
                email
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

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-foreground">
                senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-11 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isLogin && (
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    esqueci a senha
                  </button>
                </div>
              )}
            </div>

            {/* Senioridade alvo — só no cadastro */}
            {!isLogin && (
              <div>
                <label htmlFor="senioridadeAlvo" className="block mb-1.5 text-sm font-medium text-foreground">
                  senioridade alvo{" "}
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <select
                  id="senioridadeAlvo"
                  name="senioridadeAlvo"
                  value={formData.senioridadeAlvo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-shadow text-sm"
                >
                  <option value="">selecione...</option>
                  {SENIORIDADE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Stacks — só no cadastro, só se a API retornou a lista */}
            {!isLogin && stacks.length > 0 && (
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label className="text-sm font-medium text-foreground">
                    stacks{" "}
                    <span className="text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  {selectedStackIds.length > 0 && (
                    <span className="text-xs font-mono text-primary">
                      {selectedStackIds.length} selecionada{selectedStackIds.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <StacksMultiSelect
                  stacks={stacks}
                  selectedIds={selectedStackIds}
                  onChange={setSelectedStackIds}
                />
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
