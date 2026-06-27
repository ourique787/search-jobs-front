import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { motion } from "motion/react";
import { api } from "@/services/api";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Informe seu email."); return; }
    setStatus("loading");
    setError(null);
    try {
      await api.auth.forgotPassword(email);
      setStatus("sent");
    } catch {
      setError("Não foi possível enviar o email. Tente novamente.");
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
        <div className="mb-8">
          <BrandLogo />
        </div>

        {status === "sent" ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">email enviado</h2>
            <p className="text-sm text-muted-foreground">
              Se o endereço existir na plataforma, você receberá as instruções em breve. Verifique também a caixa de spam.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 rounded-xl transition-colors font-medium"
            >
              voltar ao login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-display font-bold text-foreground mb-1">esqueci a senha</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Informe seu email e enviaremos um link para redefinir sua senha.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-foreground">
                  email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="seu@email.com"
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-accent hover:bg-accent/90 disabled:opacity-60 text-accent-foreground py-3 rounded-xl transition-colors font-medium shadow-sm"
              >
                {status === "loading" ? "enviando..." : "enviar link"}
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
