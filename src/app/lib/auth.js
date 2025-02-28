import { supabase } from "@/app/lib/supabaseClient";

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`, // 🔥 Stelle sicher, dass dies korrekt ist!
    },
  });

  if (error) {
    console.error("Google Login Error:", error);
  }
}