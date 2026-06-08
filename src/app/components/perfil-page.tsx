import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  ChevronRight,
  LogOut,
  Linkedin,
  Github,
  MapPin,
  Save,
  Check,
  AlertCircle,
  Briefcase,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "./header";
import { api } from "@/services/api";
import { SENIORIDADE_DISPLAY } from "@/types";
import type { Senioridade } from "@/types";

type Section = "informacoes" | "preferencias" | "seguranca";

const SENIORIDADES: Senioridade[] = ["ESTAGIARIO", "JUNIOR", "PLENO", "SENIOR"];

function useLocalProfile(email: string) {
  const key = `sj_profile_extras_${email}`;
  function load() {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "{}") as Record<string, string>;
    } catch {
      return {} as Record<string, string>;
    }
  }
  function save(data: Record<string, string>) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  return { load, save };
}

export function PerfilPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { load: loadExtras, save: saveExtras } = useLocalProfile(user?.email ?? "");

  const [section, setSection] = useState<Section>("informacoes");

  // --- Informações pessoais ---
  const [nome, setNome] = useState(user?.nome ?? "");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [cidade, setCidade] = useState("");
  const [infoStatus, setInfoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [infoError, setInfoError] = useState("");

  // --- Preferências ---
  const [senioridadeAlvo, setSenioridadeAlvo] = useState<Senioridade | "">("");
  const [prefStatus, setPrefStatus] = useState<"idle" | "loading" | "success">("idle");

  // --- Segurança ---
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [pwStatus, setPwStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    const extras = loadExtras();
    setLinkedin(extras.linkedin ?? "");
    setGithub(extras.github ?? "");
    setCidade(extras.cidade ?? "");
    setSenioridadeAlvo((extras.senioridadeAlvo as Senioridade) ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setInfoError("Nome é obrigatório.");
      return;
    }
    setInfoStatus("loading");
    setInfoError("");
    try {
      await api.users.updateProfile({ nome: nome.trim() });
      updateUser({ nome: nome.trim() });
      saveExtras({ ...loadExtras(), linkedin, github, cidade });
      setInfoStatus("success");
      setTimeout(() => setInfoStatus("idle"), 3000);
    } catch (err) {
      setInfoError(err instanceof Error ? err.message : "Erro ao salvar.");
      setInfoStatus("error");
    }
  };

  const handleSavePrefs = async () => {
    setPrefStatus("loading");
    saveExtras({ ...loadExtras(), senioridadeAlvo });
    await new Promise((r) => setTimeout(r, 400));
    setPrefStatus("success");
    setTimeout(() => setPrefStatus("idle"), 3000);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (novaSenha !== confirmarSenha) {
      setPwError("As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      setPwError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setPwStatus("loading");
    try {
      await api.users.updatePassword({ senhaAtual, novaSenha });
      setPwStatus("success");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setTimeout(() => setPwStatus("idle"), 3000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Erro ao alterar senha.");
      setPwStatus("error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems: { section: Section; label: string; Icon: React.ElementType }[] = [
    { section: "informacoes", label: "Informações pessoais", Icon: User },
    { section: "preferencias", label: "Preferências de vagas", Icon: Briefcase },
    { section: "seguranca", label: "Segurança", Icon: Lock },
  ];

  const inputClass =
    "w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors";

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar ── */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 border-r border-border bg-card overflow-y-auto">
          {/* Avatar card */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-xl font-bold text-primary-foreground">
                  {user?.initials ?? "?"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {user?.nome ?? "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Meu perfil
              </p>
              {navItems.map(({ section: s, label, Icon }) => (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 ${
                    section === s
                      ? "bg-accent/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                  {section === s && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>

            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Conta
              </p>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile section strip */}
          <div className="lg:hidden flex gap-1 p-3 border-b border-border bg-card overflow-x-auto">
            {navItems.map(({ section: s, label }) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  section === s
                    ? "bg-accent/20 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="max-w-2xl mx-auto p-6 lg:p-10">
            <AnimatePresence mode="wait">
              {/* ── Informações pessoais ── */}
              {section === "informacoes" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Banner */}
                  <div className="relative h-28 sm:h-36 rounded-2xl bg-gradient-to-br from-accent/40 via-primary/15 to-accent/5 mb-16 overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-[0.15]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, var(--color-accent) 1px, transparent 1px)",
                        backgroundSize: "22px 22px",
                      }}
                    />
                    {/* Floating avatar */}
                    <div className="absolute -bottom-10 left-6 sm:left-8">
                      <div className="w-20 h-20 bg-primary rounded-full border-4 border-card flex items-center justify-center shadow-xl">
                        <span className="text-2xl font-bold text-primary-foreground">
                          {user?.initials ?? "?"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h1 className="text-xl font-semibold text-foreground">{user?.nome}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                  </div>

                  <form onSubmit={handleSaveInfo} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>
                          Nome completo <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className={`${inputClass} pl-9`}
                            placeholder="Seu nome completo"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="email"
                            value={user?.email ?? ""}
                            disabled
                            className="w-full pl-9 pr-3 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-muted-foreground cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        <span className="flex items-center gap-1.5">
                          <Linkedin className="w-4 h-4 text-[#0077b5]" />
                          LinkedIn
                        </span>
                      </label>
                      <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className={inputClass}
                        placeholder="https://linkedin.com/in/seu-perfil"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        <span className="flex items-center gap-1.5">
                          <Github className="w-4 h-4" />
                          GitHub
                        </span>
                      </label>
                      <input
                        type="url"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className={inputClass}
                        placeholder="https://github.com/seu-usuario"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          Cidade
                        </span>
                      </label>
                      <input
                        type="text"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        className={inputClass}
                        placeholder="Ex: Porto Alegre, RS"
                      />
                    </div>

                    {infoStatus === "error" && infoError && (
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {infoError}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-muted-foreground">
                        LinkedIn, GitHub e cidade são salvos localmente.
                      </p>
                      <button
                        type="submit"
                        disabled={infoStatus === "loading"}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent text-primary font-semibold rounded-xl hover:bg-accent/90 disabled:opacity-60 transition-all text-sm"
                      >
                        {infoStatus === "loading" ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            Salvando...
                          </>
                        ) : infoStatus === "success" ? (
                          <>
                            <Check className="w-4 h-4" />
                            Salvo!
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Salvar
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ── Preferências de vagas ── */}
              {section === "preferencias" && (
                <motion.div
                  key="pref"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-xl font-semibold text-foreground mb-1">
                    Preferências de vagas
                  </h1>
                  <p className="text-sm text-muted-foreground mb-8">
                    Defina o nível de senioridade que você está buscando no mercado.
                  </p>

                  <div className="space-y-8">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground mb-4">
                        Senioridade alvo
                      </h2>
                      <div className="grid grid-cols-2 gap-3">
                        {SENIORIDADES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSenioridadeAlvo((prev) => (prev === s ? "" : s))}
                            className={`px-4 py-4 rounded-xl border text-sm font-medium transition-all text-left ${
                              senioridadeAlvo === s
                                ? "border-accent bg-accent/10 text-primary ring-1 ring-accent/40"
                                : "border-border bg-secondary text-muted-foreground hover:border-accent/50 hover:text-foreground"
                            }`}
                          >
                            <span className="block font-semibold text-base">
                              {SENIORIDADE_DISPLAY[s]}
                            </span>
                            <span className="text-xs font-normal mt-0.5 opacity-70">
                              {s === "ESTAGIARIO" && "Aprendizado e primeiros projetos"}
                              {s === "JUNIOR" && "Início da carreira profissional"}
                              {s === "PLENO" && "Experiência consolidada"}
                              {s === "SENIOR" && "Alta autonomia e liderança técnica"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={prefStatus === "loading"}
                        onClick={handleSavePrefs}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent text-primary font-semibold rounded-xl hover:bg-accent/90 disabled:opacity-60 transition-all text-sm"
                      >
                        {prefStatus === "loading" ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            Salvando...
                          </>
                        ) : prefStatus === "success" ? (
                          <>
                            <Check className="w-4 h-4" />
                            Salvo!
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Salvar preferências
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Segurança ── */}
              {section === "seguranca" && (
                <motion.div
                  key="seg"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-xl font-semibold text-foreground mb-1">Segurança</h1>
                  <p className="text-sm text-muted-foreground mb-8">
                    Altere sua senha de acesso à plataforma.
                  </p>

                  <form onSubmit={handleSavePassword} className="space-y-5 max-w-md">
                    <div>
                      <label className={labelClass}>Senha atual</label>
                      <div className="relative">
                        <input
                          type={showSenhaAtual ? "text" : "password"}
                          value={senhaAtual}
                          onChange={(e) => setSenhaAtual(e.target.value)}
                          required
                          className={`${inputClass} pr-10`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSenhaAtual((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showSenhaAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Nova senha</label>
                      <div className="relative">
                        <input
                          type={showNovaSenha ? "text" : "password"}
                          value={novaSenha}
                          onChange={(e) => setNovaSenha(e.target.value)}
                          required
                          className={`${inputClass} pr-10`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNovaSenha((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {novaSenha.length > 0 && novaSenha.length < 6 && (
                        <p className="text-xs text-destructive mt-1.5">
                          Mínimo de 6 caracteres.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>Confirmar nova senha</label>
                      <div className="relative">
                        <input
                          type={showConfirmar ? "text" : "password"}
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          required
                          className={`${inputClass} pr-10 ${
                            confirmarSenha.length > 0 && confirmarSenha !== novaSenha
                              ? "border-destructive focus:ring-destructive/50"
                              : ""
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmar((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmarSenha.length > 0 && confirmarSenha !== novaSenha && (
                        <p className="text-xs text-destructive mt-1.5">As senhas não coincidem.</p>
                      )}
                    </div>

                    {pwStatus === "error" && pwError && (
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {pwError}
                      </div>
                    )}

                    {pwStatus === "success" && (
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-accent/10 border border-accent/30 rounded-xl text-primary text-sm">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        Senha alterada com sucesso!
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={pwStatus === "loading"}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent text-primary font-semibold rounded-xl hover:bg-accent/90 disabled:opacity-60 transition-all text-sm"
                      >
                        {pwStatus === "loading" ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            Alterando...
                          </>
                        ) : pwStatus === "success" ? (
                          <>
                            <Check className="w-4 h-4" />
                            Alterada!
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Alterar senha
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
