import { createBrowserRouter } from "react-router";
import { LoginPage } from "./components/login-page";
import { DashboardPage } from "./components/dashboard-page";
import { ProtectedRoute } from "./components/protected-route";

export const router = createBrowserRouter([
  {
    path: "/",
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
]);
