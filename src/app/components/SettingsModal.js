"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function SettingsModal({ onClose }) {
  const [calorieGoal, setCalorieGoal] = useState(""); // ✅ Kalorienziel
  const [proteinGoal, setProteinGoal] = useState(""); // ✅ Protein-Ziel
  const [carbGoal, setCarbGoal] = useState(""); // ✅ Kohlenhydrate-Ziel
  const [fatGoal, setFatGoal] = useState(""); // ✅ Fett-Ziel
  const [loading, setLoading] = useState(false); // ✅ Ladezustand für Datenabruf
  const [gradientPos, setGradientPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth) * 100;
    const y = (clientY / window.innerHeight) * 100;
    setGradientPos({ x, y });
  };


  // ✅ Daten aus `users_info` abrufen
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }

      const user_id = user.user.id;
      const { data, error } = await supabase
        .from("users_info") // ✅ Richtige Tabelle
        .select("goal_calories, goal_protein, goal_carbs, goal_fat") // ✅ Richtige Spalten
        .eq("id", user_id) // ✅ User-ID als Filter
        .single();

      if (error) {
        console.error("Error fetching settings:", error.message);
      } else if (data) {
        setCalorieGoal(data.goal_calories || "");
        setProteinGoal(data.goal_protein || "");
        setCarbGoal(data.goal_carbs || "");
        setFatGoal(data.goal_fat || "");
      }

      setLoading(false);
    };

    fetchSettings();
  }, []);

  // ✅ Änderungen speichern
  const saveChanges = async () => {
    setLoading(true);
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      console.error("User not authenticated");
      setLoading(false);
      return;
    }

    const user_id = user.user.id;
    const { error } = await supabase
      .from("users_info") // ✅ Speichern in `users_info`
      .update({
        goal_calories: calorieGoal,
        goal_protein: proteinGoal,
        goal_carbs: carbGoal,
        goal_fat: fatGoal,
      })
      .eq("id", user_id);

    if (error) {
      console.error("Error saving settings:", error.message);
    } else {
      console.log("Settings saved successfully!");
    }

    setLoading(false);
    onClose(); // ✅ Modal schließen nach dem Speichern
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center"
      onClick={onClose} // ✅ Modal schließen, wenn außerhalb geklickt wird
      onMouseMove={handleMouseMove}
    >
        <div 
            className="p-6 rounded-lg w-96 max-w-full shadow-lg transition-all duration-300"
            style={{
                background: `radial-gradient(circle at ${gradientPos.x}% ${gradientPos.y}%, #2E1A47, #1d0d33)`,
                boxShadow: "0px 10px 30px rgba(126, 58, 242, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
        >
        <h2 className="text-xl font-bold text-blue-400 mb-4">Settings</h2>
  
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <>
            {/* ✅ Kalorienziel bearbeiten */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Daily Calorie Goal</label>
              <input
                type="number"
                placeholder="Enter new calorie goal"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white mt-1"
              />
            </div>
  
            {/* ✅ Protein bearbeiten */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Daily Protein Goal (g)</label>
              <input
                type="number"
                placeholder="Enter protein goal"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white mt-1"
              />
            </div>
  
            {/* ✅ Kohlenhydrate bearbeiten */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Daily Carbs Goal (g)</label>
              <input
                type="number"
                placeholder="Enter carbs goal"
                value={carbGoal}
                onChange={(e) => setCarbGoal(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white mt-1"
              />
            </div>
  
            {/* ✅ Fett bearbeiten */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Daily Fat Goal (g)</label>
              <input
                type="number"
                placeholder="Enter fat goal"
                value={fatGoal}
                onChange={(e) => setFatGoal(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white mt-1"
              />
            </div>
  
            {/* ✅ Button zum Speichern mit Gradient */}
            <button 
              className="w-full px-4 py-2 rounded transition bg-gradient-to-br from-[#7E3AF2] to-[#4A2373] hover:opacity-90"
              onClick={saveChanges} 
              disabled={loading} // ✅ Deaktiviert Button während Speicherung
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </>
        )}
  
        {/* ✅ Schließen-Button */}
        <button 
          onClick={onClose} 
          className="w-full px-4 py-2 bg-gray-700 rounded mt-2 hover:bg-gray-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}