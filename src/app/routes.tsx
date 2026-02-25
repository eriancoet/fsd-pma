import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AuthCallback } from "./pages/AuthCallback"; // ✅ add this import
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { SignUpPage } from "./pages/SignUpPage"
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

export const router = createBrowserRouter([
  // Login
  {
    path: "/",
    element: <LoginPage />,
  },
  {
  path: "/signup",
  element: <SignUpPage />,
},

  // ✅ OAuth callback must NOT be protected
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },

{ path: "/reset-password", 
  element: <ResetPasswordPage /> ,
},

  // Protected app
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "projects", element: <ProjectsPage /> },
      { path: "projects/:id", element: <ProjectDetailPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },

  // 404
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
