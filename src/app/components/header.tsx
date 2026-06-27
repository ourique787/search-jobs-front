import { useState, useEffect, useRef } from "react";
import { Settings, LogOut, ChevronDown, Menu, BarChart2 } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { resolveMediaUrl } from "@/services/api";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { label: "vagas", path: "/dashboard" },
    { label: "relatórios", path: "/relatorios" },
  ];
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <BrandLogo iconSize="w-7 h-7 sm:w-8 sm:h-8" textSize="text-lg sm:text-xl" textColor="text-primary" />

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, path }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent/20 text-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-secondary"
                  }`}
                >
                  {label === "relatórios" && (
                    <BarChart2 className="w-4 h-4" />
                  )}
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Right Side - Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-secondary rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1 sm:gap-2 p-2 hover:bg-secondary rounded-xl transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {resolveMediaUrl(user?.fotoPerfil)
                    ? <img src={resolveMediaUrl(user?.fotoPerfil)!} alt="Foto de perfil" className="w-full h-full object-cover" />
                    : <span className="text-xs sm:text-sm font-semibold text-primary-foreground">{user?.initials ?? "?"}</span>
                  }
                </div>
                <ChevronDown className="hidden sm:block w-4 h-4 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-medium text-foreground text-sm">
                        {user?.nome ?? "Usuário"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email ?? ""}
                      </p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => { setShowProfileMenu(false); navigate("/perfil"); }}
                        className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-secondary transition-colors text-foreground text-sm"
                      >
                        <Settings className="w-4 h-4" />
                        <span>meu perfil</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-secondary transition-colors text-destructive text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>sair</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pt-4 mt-4 border-t border-border"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map(({ label, path }) => {
                  const isActive = location.pathname === path;
                  return (
                    <button
                      key={path}
                      onClick={() => {
                        navigate(path);
                        setShowMobileMenu(false);
                      }}
                      className={`text-left px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium ${
                        isActive
                          ? "bg-accent/20 text-primary"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {label === "relatórios" && <BarChart2 className="w-4 h-4" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
