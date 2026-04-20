import { useState, useEffect, useRef } from "react";
import { Code2, Bell, Settings, LogOut, ChevronDown, Menu } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent rounded-xl flex items-center justify-center">
              <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-primary">
              SearchJobs
            </span>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <button className="text-foreground hover:text-primary transition-colors font-medium text-sm lg:text-base">
              Vagas
            </button>
            <button className="text-muted-foreground hover:text-primary transition-colors text-sm lg:text-base">
              Tendências Tech
            </button>
            <button className="text-muted-foreground hover:text-primary transition-colors text-sm lg:text-base">
              Sobre
            </button>
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

            {/* Notifications */}
            <button className="relative p-2 hover:bg-secondary rounded-xl transition-colors">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1 sm:gap-2 p-2 hover:bg-secondary rounded-xl transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-semibold text-primary-foreground">
                    {user?.initials ?? "?"}
                  </span>
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
                      <button className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-secondary transition-colors text-foreground text-sm">
                        <Settings className="w-4 h-4" />
                        <span>Configurações</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-secondary transition-colors text-destructive text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
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
              <div className="flex flex-col gap-3">
                <button className="text-left px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors font-medium">
                  Vagas
                </button>
                <button className="text-left px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                  Tendências Tech
                </button>
                <button className="text-left px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                  Sobre
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
