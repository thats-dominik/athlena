"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function AuthModal({ isOpen, onClose, initialStep = "login" }) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep); // "login" | "signup" | "confirm"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (step === "confirm") {
      const checkEmailConfirmation = async () => {
        const { data: userData, error } = await supabase.auth.getUser();
        if (error) {
          setError(error.message);
          return;
        }

        if (userData?.user?.email_confirmed_at) {
          setEmailConfirmed(true);
          setStep("login"); // Sobald bestätigt, wechsle zum Login
        }
      };

      // Überprüfung alle 5 Sekunden
      const interval = setInterval(checkEmailConfirmation, 5000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // SIGNUP FUNCTION
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      return;
    }

    setStep("confirm"); // Weiter zum Bestätigungsschritt
  };

  // LOGIN FUNCTION
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const { data: userData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !userData?.user) {
      setError("User authentication failed.");
      return;
    }

    router.push("/dashboard");
    onClose();
  };

  const handleGoogleAuth = async () => {
    setError(null);
  
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`, // WICHTIG: Muss mit Supabase Redirect-URLs übereinstimmen
      },
    });
  
    if (error) {
      setError(error.message);
      console.error("❌ Google Auth Fehler:", error);
    }
  
    // Entferne router.push und onClose.
    // Supabase leitet den Benutzer nach erfolgreichem Login automatisch weiter.
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative bg-gray-800 p-6 rounded-lg w-96 shadow-lg">
          <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-200" onClick={onClose}>
            ✖
          </button>

          {step === "login" && (
            <>
              <h2 className="text-lg font-bold text-center mb-4">Login</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg" />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button className="w-full bg-purple-500 py-3 rounded-lg hover:bg-purple-600">Login</button>
              </form>
              <button onClick={handleGoogleAuth} className="w-full bg-red-500 py-3 rounded-lg hover:bg-red-600 mt-2">Login with Google</button>
            </>
          )}

          {step === "signup" && (
            <>
              <h2 className="text-lg font-bold text-center mb-4">Sign Up</h2>
              <form onSubmit={handleSignup} className="space-y-4">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg" />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button className="w-full bg-purple-500 py-3 rounded-lg hover:bg-purple-600">Sign Up</button>
              </form>
              <button onClick={handleGoogleAuth} className="w-full bg-red-500 py-3 rounded-lg hover:bg-red-600 mt-2">Sign Up with Google</button>
            </>
          )}

          {step === "confirm" && (
            <>
              <h2 className="text-lg font-bold text-center mb-4">Confirm Your Email</h2>
              <p className="text-white text-center">
                Please check your email and confirm your email address before logging in.
              </p>
              <button
                disabled={!emailConfirmed}
                onClick={() => setStep("login")}
                className={`w-full mt-4 py-3 rounded-lg font-bold transition ${
                  emailConfirmed
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </>
          )}
        </div>
      </div>
    )
  );
}