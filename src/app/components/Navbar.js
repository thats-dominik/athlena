import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/app/lib/supabaseClient";

export default function Navbar() {
  const user = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="flex justify-between p-4 bg-gray-900 text-white">
      <Link href="/" className="text-lg font-bold">Athlena</Link>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <p>👤 {user.email}</p>
            <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login" className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}