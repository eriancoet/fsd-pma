import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { router } from "./routes";
import { RouterProvider } from "react-router-dom";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
       <div className="min-h-screen bg-background text-foreground">
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </div>
      </DataProvider>
    </AuthProvider>
  );
}