import { useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabaseClient";

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        console.error("OAuth exchange error:", error.message);
        navigate("/", { replace: true });
        return;
      }

      if (data?.session) {
        navigate("/projects", { replace: true });
        return;
      }

      navigate("/", { replace: true });
    })();
  }, [navigate]);

  return null;
}
