import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Code2, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/services/api";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center space-y-3">
          <p className="text-destructive font-medium">Link inválido ou expirado.</p>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            voltar ao login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (novaSenha.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmar) {
      setError("As senhas não coincidem.");
      return;
    }

    setStatus("loading");
    try {
      await api.auth.resetPassword(token, novaSenha);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px]"
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">SearchJobs</span>
        </div>

        {status === "success" ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">Senha redefinida!</h2>
            <p className="text-sm text-muted-foreground">Sua nova senha foi salva. Faça login para continuar.</p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 rounded-xl transition-colors font-medium"
            >
              ir para o login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-display font-bold text-foreground mb-1">nova senha</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Escolha uma senha com ao menos 6 caracteres.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-foreground">
                  nova senha
                </label>
                <div className="relative">
                  <input
                    type={showSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => { setNovaSenha(e.target.value); setError(null); }}
                    className="w-full px-4 py-3 pr-11 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    placeholder="••••••••"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha((p) => !p)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-foreground">
                  confirmar senha
                </label>
                <input
                  type={showSenha ? "text" : "password"}
                  value={confirmar}
                  onChange={(e) => { setConfirmar(e.target.value); setError(null); }}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-accent hover:bg-accent/90 disabled:opacity-60 text-accent-foreground py-3 rounded-xl transition-colors font-medium shadow-sm"
              >
                {status === "loading" ? "salvando..." : "salvar nova senha"}
              </button>
            </form>

            <p className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                voltar ao login
              </button>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
