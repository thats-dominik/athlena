"use client";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutPage() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("Logout erfolgreich!");
    window.location.href = "/";
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Logout</h1>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        onClick={handleLogout}
      >
        Ausloggen
      </button>
    </main>
  );
}