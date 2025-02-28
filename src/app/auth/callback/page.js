"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("❌ Fehler beim Abrufen der Session:", error);
        router.push("/"); // Falls Fehler → zurück zur Startseite
        return;
      }

      if (data?.session?.user) {
        console.log("✅ Erfolgreich angemeldet:", data.session.user);
        router.push("/dashboard"); // Weiter zum Dashboard nach erfolgreichem Login
      }
    };

    handleAuth();
  }, []);

  return <p className="text-center text-white">Authenticating...</p>;
}