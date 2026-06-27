import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  ChevronRight,
  LogOut,
  Linkedin,
  Github,
  Save,
  Check,
  AlertCircle,
  Briefcase,
  Eye,
  EyeOff,
  Search,
  Camera,
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "./header";
import { api, resolveMediaUrl } from "@/services/api";
import { SENIORIDADE_DISPLAY } from "@/types";
import type { Senioridade, Stack } from "@/types";
import { SENHA_REGEX, SENHA_ERRO } from "@/utils/format";

type Section = "informacoes" | "preferencias" | "seguranca";

const SENIORIDADES: Senioridade[] = ["ESTAGIARIO", "JUNIOR", "PLENO", "SENIOR"];

function normalizeUrl(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

function isValidUrl(value: string): boolean {
  if (!value.trim()) return true;
  return value.includes(".");
}

export function PerfilPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [section, setSection] = useState<Section>("informacoes");

  // --- Informações pessoais ---
  const [nome, setNome] = useState(user?.nome ?? "");
  const [linkedin, setLinkedin] = useState(user?.linkedin ?? "");
  const [github, setGithub] = useState(user?.github ?? "");
  const [infoStatus, setInfoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [infoError, setInfoError] = useState("");

  // --- Preferências ---
  const [senioridadeAlvo, setSenioridadeAlvo] = useState<Senioridade | "">(user?.senioridadeAlvo ?? "");
  const [preferredStacks, setPreferredStacks] = useState<string[]>(
    user?.stacksPreferidas?.map((s) => s.nome) ?? []
  );
  const [allStacks, setAllStacks] = useState<Stack[]>([]);
  const [stackSearch, setStackSearch] = useState("");
  const [prefStatus, setPrefStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // --- Segurança ---
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [pwStatus, setPwStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pwError, setPwError] = useState("");

  // --- Foto de perfil ---
  const [fotoStatus, setFotoStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    api.stacks.list().then(setAllStacks).catch(() => {});
  }, []);

  // Sincroniza formulário quando o contexto atualiza (ex: após refresh)
  useEffect(() => {
    if (!user) return;
    setNome(user.nome);
    setLinkedin(user.linkedin ?? "");
    setGithub(user.github ?? "");
    setSenioridadeAlvo(user.senioridadeAlvo ?? "");
    setPreferredStacks(user.stacksPreferidas?.map((s) => s.nome) ?? []);
  }, [user]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setInfoError("Nome é obrigatório.");
      setInfoStatus("error");
      return;
    }
    if (!isValidUrl(linkedin) || !isValidUrl(github)) {
      setInfoError("verifique os campos de URL.");
      setInfoStatus("error");
      return;
    }
    setInfoStatus("loading");
    setInfoError("");
    try {
      const res = await api.users.updateProfile({
        nome: nome.trim(),
        linkedin: normalizeUrl(linkedin) || null,
        github: normalizeUrl(github) || null,
      });
      updateUser({ nome: res.nome, linkedin: res.linkedin ?? null, github: res.github ?? null });
      setInfoStatus("success");
      setTimeout(() => setInfoStatus("idle"), 3000);
    } catch (err) {
      setInfoError(err instanceof Error ? err.message : "Erro ao salvar.");
      setInfoStatus("error");
    }
  };

  const handleSavePrefs = async () => {
    setPrefStatus("loading");
    try {
      const stackIds = allStacks
        .filter((s) => preferredStacks.includes(s.nome))
        .map((s) => s.id);
      const res = await api.users.updateProfile({
        senioridadeAlvo: senioridadeAlvo || null,
        stackIds,
      });
      updateUser({
        senioridadeAlvo: res.senioridadeAlvo ?? null,
        stacksPreferidas: res.stacksPreferidas ?? [],
      });
      setPrefStatus("success");
      setTimeout(() => setPrefStatus("idle"), 3000);
    } catch {
      setPrefStatus("error");
    }
  };

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5 MB.");
      return;
    }
    setFotoStatus("loading");
    try {
      const res = await api.users.uploadFoto(file);
      console.log("[foto] resposta do backend:", res);
      console.log("[foto] fotoPerfil recebido:", res.fotoPerfil);
      console.log("[foto] URL resolvida:", resolveMediaUrl(res.fotoPerfil));
      updateUser({ fotoPerfil: res.fotoPerfil ?? null });
      setFotoStatus("idle");
    } catch (err) {
      console.error("[foto] erro no upload:", err);
      setFotoStatus("error");
      setTimeout(() => setFotoStatus("idle"), 3000);
    }
  };

  const togglePreferredStack = (nome: string) => {
    setPreferredStacks((prev) =>
      prev.includes(nome) ? prev.filter((s) => s !== nome) : [...prev, nome]
    );
  };

  const filteredPrefStacks = allStacks.filter((s) =>
    s.nome.toLowerCase().includes(stackSearch.toLowerCase())
  );

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (!SENHA_REGEX.test(novaSenha)) {
      setPwError(SENHA_ERRO);
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setPwError("As senhas não coincidem.");
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
    { section: "informacoes", label: "informações pessoais", Icon: User },
    { section: "preferencias", label: "preferências de vagas", Icon: Briefcase },
    { section: "seguranca", label: "segurança", Icon: Lock },
  ];

  const inputClass =
    "w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden max-w-[1600px] mx-auto w-full pl-4 sm:pl-6 pr-4 sm:pr-6">

        {/* ── Left sidebar ── */}
        <div className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 pt-6 sm:pt-8 pb-4 overflow-y-auto">
          <aside className="flex flex-col bg-card border border-border rounded-xl overflow-hidden">
            {/* Avatar card */}
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                  {resolveMediaUrl(user?.fotoPerfil)
                    ? <img src={resolveMediaUrl(user?.fotoPerfil)!} alt="Foto de perfil" className="w-full h-full object-cover" />
                    : <span className="text-lg font-bold text-primary-foreground">{user?.initials ?? "?"}</span>
                  }
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
            <nav className="p-4 space-y-6">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground tracking-wider px-3 mb-2">
                  meu perfil
                </p>
                {navItems.map(({ section: s, label, Icon }) => (
                  <button
                    key={s}
                    onClick={() => setSection(s)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 ${
                      section === s
                        ? "bg-primary/10 text-primary"
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
                <p className="text-[11px] font-semibold text-muted-foreground tracking-wider px-3 mb-2">
                  conta
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  sair
                </button>
              </div>
            </nav>
          </aside>
        </div>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto ml-4 sm:ml-6">
          {/* Mobile section strip */}
          <div className="lg:hidden flex gap-1 p-3 border-b border-border bg-card overflow-x-auto">
            {navItems.map(({ section: s, label }) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  section === s
                    ? "bg-primary/10 text-primary"
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
                  <div className="relative h-28 sm:h-36 mb-16">
                    {/* Background separado para não clipar o avatar */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/40 via-primary/15 to-accent/5 overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-[0.15]"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle, var(--color-accent) 1px, transparent 1px)",
                          backgroundSize: "22px 22px",
                        }}
                      />
                    </div>
                    {/* Floating avatar */}
                    <div className="absolute -bottom-10 left-6 sm:left-8">
                      <label className="relative cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleUploadFoto}
                          disabled={fotoStatus === "loading"}
                        />
                        <div className="w-20 h-20 bg-primary rounded-full border-4 border-card flex items-center justify-center shadow-xl overflow-hidden">
                          {(() => {
                            const url = resolveMediaUrl(user?.fotoPerfil);
                            console.log("[foto] user.fotoPerfil:", user?.fotoPerfil, "| URL resolvida:", url);
                            return url
                              ? <img src={url} alt="Foto de perfil" className="w-full h-full object-cover" onError={(e) => console.error("[foto] erro ao carregar imagem:", e.currentTarget.src)} />
                              : <span className="text-2xl font-bold text-primary-foreground">{user?.initials ?? "?"}</span>;
                          })()}
                        </div>
                        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          {fotoStatus === "loading"
                            ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            : <Camera className="w-5 h-5 text-white" />
                          }
                        </div>
                      </label>
                      {fotoStatus === "error" && (
                        <p className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-destructive bg-card border border-destructive/30 rounded-lg px-2 py-1 shadow">
                          erro ao enviar foto.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h1 className="text-xl font-display font-bold text-foreground">{user?.nome}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                  </div>

                  <form onSubmit={handleSaveInfo} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>
                          nome completo <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className={`${inputClass} pl-9`}
                            placeholder="seu nome completo"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>email</label>
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
                          linkedin
                        </span>
                      </label>
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className={`${inputClass} ${linkedin && !isValidUrl(linkedin) ? "border-destructive focus:ring-destructive/50" : ""}`}
                        placeholder="linkedin.com/in/seu-perfil"
                      />
                      {linkedin && !isValidUrl(linkedin) && (
                        <p className="text-xs text-destructive mt-1.5">URL inválida.</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>
                        <span className="flex items-center gap-1.5">
                          <Github className="w-4 h-4" />
                          github
                        </span>
                      </label>
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className={`${inputClass} ${github && !isValidUrl(github) ? "border-destructive focus:ring-destructive/50" : ""}`}
                        placeholder="github.com/seu-usuario"
                      />
                      {github && !isValidUrl(github) && (
                        <p className="text-xs text-destructive mt-1.5">URL inválida.</p>
                      )}
                    </div>

                    {infoStatus === "error" && infoError && (
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {infoError}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={infoStatus === "loading"}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground font-semibold rounded-xl hover:bg-primary disabled:opacity-60 transition-all text-sm"
                      >
                        {infoStatus === "loading" ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            salvando...
                          </>
                        ) : infoStatus === "success" ? (
                          <>
                            <Check className="w-4 h-4" />
                            salvo!
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            salvar
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
                    preferências de vagas
                  </h1>
                  <p className="text-sm text-muted-foreground mb-8">
                    Suas preferências priorizam vagas correspondentes na página de vagas.
                  </p>

                  <div className="space-y-8">
                    <div>
                      <h2 className="text-sm font-display font-medium text-foreground mb-4">
                        Senioridade alvo
                      </h2>
                      <div className="grid grid-cols-2 gap-3">
                        {SENIORIDADES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSenioridadeAlvo((prev) => (prev === s ? "" : s))}
                            className={`px-4 py-4 rounded-xl border text-sm font-medium normal-case transition-all text-left ${
                              senioridadeAlvo === s
                                ? "border-primary bg-primary/8 text-primary ring-1 ring-primary/30"
                                : "border-border bg-secondary text-muted-foreground hover:border-accent/50 hover:text-foreground"
                            }`}
                          >
                            <span className="block font-mono font-medium text-base">
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

                    {/* Stacks de interesse */}
                    <div>
                      <h2 className="text-sm font-display font-medium text-foreground mb-1">
                        Tecnologias de interesse
                      </h2>
                      <p className="text-xs font-mono text-muted-foreground mb-4">
                        {preferredStacks.length > 0
                          ? `${preferredStacks.length} selecionada${preferredStacks.length > 1 ? "s" : ""}`
                          : "nenhuma selecionada"}
                      </p>

                      <div className="relative mb-3">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          value={stackSearch}
                          onChange={(e) => setStackSearch(e.target.value)}
                          placeholder="buscar tecnologia..."
                          className="w-full pl-8 pr-3 py-2 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1 border border-border rounded-xl p-3 bg-secondary/30">
                        {filteredPrefStacks.map((stack) => (
                          <label
                            key={stack.id}
                            className="flex items-center gap-2.5 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={preferredStacks.includes(stack.nome)}
                              onChange={() => togglePreferredStack(stack.nome)}
                              className="w-4 h-4 rounded border-border accent-[#6366F1]"
                            />
                            <span className="text-sm font-mono text-foreground group-hover:text-primary transition-colors">
                              {stack.nome}
                            </span>
                          </label>
                        ))}
                        {filteredPrefStacks.length === 0 && (
                          <p className="text-xs text-muted-foreground py-1">nenhuma encontrada.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={prefStatus === "loading"}
                        onClick={handleSavePrefs}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground font-semibold rounded-xl hover:bg-primary disabled:opacity-60 transition-all text-sm"
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
                            salvar preferências
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
                  <h1 className="text-xl font-semibold text-foreground mb-1">segurança</h1>
                  <p className="text-sm text-muted-foreground mb-8">
                    altere sua senha de acesso à plataforma.
                  </p>

                  <form onSubmit={handleSavePassword} className="space-y-5 max-w-md">
                    <div>
                      <label className={labelClass}>senha atual</label>
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
                      <label className={labelClass}>nova senha</label>
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
                      {novaSenha.length > 0 && !SENHA_REGEX.test(novaSenha) && (
                        <p className="text-xs text-destructive mt-1.5">
                          {SENHA_ERRO}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>confirmar nova senha</label>
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
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-success-soft border border-success/30 rounded-xl text-success text-sm">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        Senha alterada com sucesso!
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={pwStatus === "loading"}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground font-semibold rounded-xl hover:bg-primary disabled:opacity-60 transition-all text-sm"
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

        </div>{/* max-w container */}
      </div>
    </div>
  );
}
