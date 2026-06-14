import { createBrowserRouter } from "react-router";
import { HomePage } from "./components/home-page";
import { LoginPage } from "./components/login-page";
import { DashboardPage } from "./components/dashboard-page";
import { RelatoriosPage } from "./components/relatorios-page";
import { PerfilPage } from "./components/perfil-page";
import { ProtectedRoute } from "./components/protected-route";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/login",
    Component: LoginPage,
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
