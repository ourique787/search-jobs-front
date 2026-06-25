import { createBrowserRouter } from "react-router";
import { LoginPage } from "./components/login-page";
import { DashboardPage } from "./components/dashboard-page";
import { RelatoriosPage } from "./components/relatorios-page";
import { PerfilPage } from "./components/perfil-page";
import { ProtectedRoute } from "./components/protected-route";
import { ResetPasswordPage } from "./components/reset-password-page";
import { ForgotPasswordPage } from "./components/forgot-password-page";
import { OnboardingPage } from "./components/onboarding-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordPage,
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/relatorios",
    element: (
      <ProtectedRoute>
        <RelatoriosPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/perfil",
    element: (
      <ProtectedRoute>
        <PerfilPage />
      </ProtectedRoute>
    ),
  },
]);
