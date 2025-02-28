"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import SetupModal from "@/app/components/SetupModal";
import { FiSettings } from "react-icons/fi";
import { FaHome, FaUtensils, FaRunning, FaUser } from "react-icons/fa";
import { MealModal } from "@/app/components/MealModal"; // 🔥 Modal für Mahlzeiten
import MealDetailModal from "@/app/components/MealDetailModal"; // ✅ Import des Modals
import SettingsModal from "@/app/components/SettingsModal"; // ✅ Import Settings Modal

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [meals, setMeals] = useState([]);
  const [weekStats, setWeekStats] = useState([]);
  const [isSetupRequired, setIsSetupRequired] = useState(false);
  const [isMealOpen, setIsMealOpen] = useState(false); // 🔥 Neu: Modal für Mahlzeitensteuerung
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // ✅ State für Modal

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/"); // ✅ Redirect to homepage if no user is logged in
      } else {
        setUser(user);
        fetchUserInfo(user.id);
        fetchMeals(user.id);
        fetchStats(user.id);
      }
    };

    checkUser();
  }, []);

  const fetchUserInfo = async (userId) => {
    const { data, error } = await supabase
      .from("users_info")
      .select("*, goal_protein, goal_carbs, goal_fat")
      .eq("id", userId)
      .single();
  
    if (error || !data) {
      console.error("Error fetching user info:", error);
      setIsSetupRequired(true);
      return;
    }
  
    setUserInfo(data);
  };

  const fetchMeals = async (userId) => {
    let { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching meals:", error.message, error.details);
      return;
    }

    console.log("Fetched meals:", data);
    setMeals(data || []);
};

const deleteMeal = async (mealId) => {
  const { error } = await supabase.from("meals").delete().eq("id", mealId);

  if (error) {
    console.error("Error deleting meal:", error);
    return;
  }

  setMeals(meals.filter((meal) => meal.id !== mealId));
};


  const fetchStats = async (userId) => {
    let { data, error } = await supabase
      .from("stats")
      .select("date, calories")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching stats:", error);
      return;
    }

    setWeekStats(data || []);
  };

  return (
    <main className="h-screen overflow-y-auto bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Header mit User-Info */}
      <header className="flex items-center justify-between p-6 bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-full"></div>
          <div>
            <p className="text-lg font-bold">
              hello, {userInfo?.full_name || user?.email || "guest"}
            </p>
            <p className="text-sm text-gray-400">
              daily goal: {userInfo?.goal_calories || 2200} kcal
            </p>
          </div>
        </div>
        <FiSettings 
          className="text-xl text-gray-400 hover:text-white cursor-pointer" 
          onClick={() => setIsSettingsOpen(true)} // ✅ Klick öffnet das Modal
        />
      </header>

      {/* Kalorienübersicht */}
      <section className="p-6">
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
    <h2 className="text-lg font-bold mb-4">calories overview</h2>

    <div className="relative w-32 h-32">
      <CircularProgressbar
        value={(meals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0) / (userInfo?.goal_calories || 2200)) * 100}
        text={`${meals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0)} kcal`}
        styles={buildStyles({
          textColor: "#fff",
          pathColor: "#7E3AF2",
          trailColor: "#4B5563",
        })}
      />
    </div>

    <p className="text-sm text-gray-400 mt-2">/ {userInfo?.goal_calories || 2200} kcal</p>

    {/* Makronährstoffe */}
    <div className="grid grid-cols-3 gap-4 mt-4 w-full text-center">
      <div>
        <p className="text-blue-400 font-bold">
          {meals.reduce((sum, meal) => sum + (meal.total_protein || 0), 0)}g / {userInfo?.goal_protein || 150}g
        </p>
        <div className="w-full h-2 bg-gray-700 rounded mt-1">
          <div
            className="h-2 bg-blue-500 rounded"
            style={{
              width: `${
                (meals.reduce((sum, meal) => sum + (meal.total_protein || 0), 0) /
                  (userInfo?.goal_protein || 150)) * 100
              }%`,
            }}
          ></div>
        </div>
        <p className="text-gray-400 text-sm">protein</p>
      </div>
      <div>
        <p className="text-blue-400 font-bold">
          {meals.reduce((sum, meal) => sum + (meal.total_carbs || 0), 0)}g / {userInfo?.goal_carbs || 250}g
        </p>
        <div className="w-full h-2 bg-gray-700 rounded mt-1">
          <div
            className="h-2 bg-green-500 rounded"
            style={{
              width: `${
                (meals.reduce((sum, meal) => sum + (meal.total_carbs || 0), 0) /
                  (userInfo?.goal_carbs || 250)) * 100
              }%`,
            }}
          ></div>
        </div>
        <p className="text-gray-400 text-sm">carbs</p>
      </div>
      <div>
        <p className="text-blue-400 font-bold">
          {meals.reduce((sum, meal) => sum + (meal.total_fat || 0), 0)}g / {userInfo?.goal_fat || 80}g
        </p>
        <div className="w-full h-2 bg-gray-700 rounded mt-1">
          <div
            className="h-2 bg-yellow-500 rounded"
            style={{
              width: `${
                (meals.reduce((sum, meal) => sum + (meal.total_fat || 0), 0) /
                  (userInfo?.goal_fat || 80)) * 100
              }%`,
            }}
          ></div>
        </div>
        <p className="text-gray-400 text-sm">fat</p>
      </div>
    </div>
  </div>
</section>

{/* Mahlzeitenübersicht */}
<section className="p-6">
  <h2 className="text-lg font-bold mb-4">Today's Meals</h2>
  <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
    {["breakfast", "lunch", "dinner", "snack"].map((category) => {
      const mealsByCategory = meals.filter((meal) => meal.meal_category === category);
      return (
        <div key={category} className="mb-6">
          <h3 className="text-md font-semibold text-blue-400 mb-2">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h3>
          {mealsByCategory.length > 0 ? (
            mealsByCategory.map((meal) => (
              <div 
                key={meal.id} 
                className="flex justify-between items-center border-b border-gray-700 py-2 cursor-pointer hover:bg-gray-700 rounded-lg transition"
                onClick={() => setSelectedMeal(meal)} // ✅ Modal öffnet sich bei Klick
              >
                <div>
                  {/* ✅ Food Name anzeigen */}
                  <p className="font-bold">{meal.meal_name || "Unnamed Meal"}</p>

                  {/* ✅ Gesamt-Kalorien des Meals */}
                  <p className="text-sm text-gray-400">{meal.total_calories} kcal</p>

                  {/* ✅ Detaillierte Makronährstoffe unter Kalorien */}
                  <p className="text-gray-400 text-sm">
                    {meal.total_protein}g Protein | {meal.total_carbs}g Carbs | {meal.total_fat}g Fat
                  </p>
                </div>
                {/* ❌ Delete-Knopf */}
                <button 
                  className="text-red-500 hover:text-red-700 p-1"
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ Verhindert, dass das Modal beim Löschen öffnet
                    deleteMeal(meal.id);
                  }}
                >
                  ❌
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No meals logged yet.</p>
          )}
        </div>
      );
    })}
  </div>
  <div className="mb-20"></div>
</section>

      {/* Meal Modal */}
      {isMealOpen && <MealModal onClose={() => setIsMealOpen(false)} />} {/* ✅ Wird durch Icon-Click geöffnet */}

        {/* Meal Detail Modal */}
        {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}

      {/* User Setup Modal */}
      {isSetupRequired && <SetupModal />}

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex justify-around">
       <NavIcon icon={<FaHome />} onClick={() => router.push("/")} />
        <NavIcon icon={<FaUtensils />} onClick={() => setIsMealOpen(true)} /> {/* ✅ Besteck öffnet jetzt Modal */}
        <NavIcon icon={<FaRunning />} />
        <NavIcon icon={<FaUser />} />
      </nav>
    </main>
  );
}

// Navigation Icon Component
function NavIcon({ icon, onClick }) {
  return (
    <div 
      className="text-white text-2xl p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
      onClick={onClick} // ✅ Jetzt kann jedes Icon angeklickt werden
    >
      {icon}
    </div>
  );
}