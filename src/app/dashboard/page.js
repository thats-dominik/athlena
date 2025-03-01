"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import SetupModal from "@/app/components/SetupModal";
import { FiSettings } from "react-icons/fi";
import { FaHome, FaUtensils, FaRunning, FaUser, FaCalendarAlt, FaSearch} from "react-icons/fa";
import { MealModal } from "@/app/components/MealModal"; // 🔥 Modal für Mahlzeiten
import MealDetailModal from "@/app/components/MealDetailModal"; // ✅ Import des Modals
import SettingsModal from "@/app/components/SettingsModal"; // ✅ Import Settings Modal
import CalendarModal from "@/app/components/CalendarModal"; // 📅 Import der Kalender-Modal
import { usePathname } from "next/navigation"; // ✅ Importiere usePathname
import WaterTracker from "@/app/components/WaterTracker"; // ✅ Importieren

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [meals, setMeals] = useState([]);
  const [weekStats, setWeekStats] = useState([]);
  const [isSetupRequired, setIsSetupRequired] = useState(false);
  const [isMealOpen, setIsMealOpen] = useState(false); // 🔥 Neu: Modal für Mahlzeitensteuerung
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // ✅ State für Modal
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // 📅 State für Modal
  const [dashboardDate, setDashboardDate] = useState(() => new Date()); // ✅ Standardwert ist `Date`-Objekt
  const pathname = usePathname(); // ✅ Aktuellen Pfad holen
  const [parallaxStyle, setParallaxStyle] = useState({});
  

    function handleParallax(event, setBackgroundStyle) {
    const { clientX, clientY } = event;
    const xOffset = (clientX / window.innerWidth - 0.5) * 40; // Sanfte Bewegung
    const yOffset = (clientY / window.innerHeight - 0.5) * 15;
  
    setBackgroundStyle({
      //          background: `radial-gradient(circle at ${gradientPos.x}% ${gradientPos.y}%, #2E1A47, #1d0d33)`,
      background: `radial-gradient(circle at ${50 + xOffset}% ${50 + yOffset}%,#2E1A47,#1d0d33`,
      transition: "background 0.1s ease-out", // Weicher Übergang
    });
  }
  

    // ✅ 1️⃣ Erster `useEffect` zum Laden des Users
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
          fetchMealsByDate(dashboardDate);
        }
      };

      checkUser();
    }, []); // ✅ Wird nur einmal ausgeführt

    

    useEffect(() => {
      if (!dashboardDate || !user) return;
    
      console.log("📅 Date changed to:", dashboardDate);
      
      fetchMealsByDate(dashboardDate);
    }, [dashboardDate, user]);

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
  const openMealModal = (category) => {
    setSelectedCategory(category); // ✅ Setzt die ausgewählte Kategorie
    setIsMealOpen(true); // ✅ Öffnet das Modal
  };

  const fetchMealsByDate = async (date) => {
    if (!user) return;
  
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
  
    let { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startOfDay.toISOString())  // ⬅️ Beginn des Tages
      .lte("date", endOfDay.toISOString())    // ⬅️ Ende des Tages
      .order("date", { ascending: false });
  
    if (error) {
      console.error("Error fetching meals:", error.message, error.details);
      return;
    }
  
    console.log(`Fetched meals for ${startOfDay.toISOString()}:`, data);
  
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
    <main
      className="min-h-screen overflow-y-auto bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white pb-24"
      onMouseMove={(event) => handleParallax(event, setParallaxStyle)}
      style={parallaxStyle}
    >
      {/* Header mit User-Info */}
      <header className="flex items-center justify-between px-8 py-6">
  {/* Links: Begrüßung & Datum */}
  <div className="flex items-center gap-6">
    <div>
      <p className="text-gray-400 text-sm tracking-wide">good morning,</p>
      <p className="text-white text-2xl font-semibold tracking-wide">
        {userInfo?.full_name || user?.email || "guest"}
      </p>
    </div>
  </div>

{/* Rechts: Settings-Button + Kalender */}
<div className="flex items-center gap-4">
  {/* 📅 Klickbares Datum */}
  <p 
    className="text-white font-bold text-lg cursor-pointer flex items-center gap-2" 
    onClick={() => setIsCalendarOpen(true)}
  >
    {dashboardDate.toLocaleDateString("en-GB")}
    {/* 📅 Kleines Kalender-Icon neben dem Datum */}
    <FaCalendarAlt 
      className="text-gray-400 text-[1.4rem] ml-2 cursor-pointer hover:text-white transition" 
      onClick={() => setIsCalendarOpen(true)}
    />
  </p>

    {/* ⚙️ Settings-Button */}
    <FiSettings
      className="text-2xl text-gray-400 hover:text-white cursor-pointer"
      onClick={() => setIsSettingsOpen(true)}
    />
    {/* Profilbild */}
    <div className="w-12 h-12 bg-[#7E3AF2] rounded-full flex items-center justify-center"></div>
  </div>
</header>
  
      {/* Hauptbereich */}
      <section className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
        {/* 🔥 Linke Seite: Kalorien & Makronährstoffe */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#7E3AF2] to-[#282133] p-6 rounded-2xl shadow-lg">
              <h2 className="text-base text-gray-300 font-semibold">
                Count Your <span className="text-white">Daily Calories</span>
              </h2>
              <p className="text-gray-300 text-sm mt-1">
                Eaten {meals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0)}
              </p>
              <div className="flex items-center mt-2">
              <p className="text-white text-4xl font-bold">
                  {isNaN(userInfo?.goal_calories - meals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0))
                    ? 0
                    : userInfo?.goal_calories - meals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0)}
                </p>
                <span className="text-white text-2xl mx-2 font-bold">/</span>
                <p className="text-white text-2xl font-light">{userInfo?.goal_calories || 2200} Kcal left</p>
              </div>
              <div className="mt-4 flex items-center">
                <div className="flex-grow bg-gray-800 h-3 rounded-full">
                  <div
                    className="h-3 bg-[#A07EFB] rounded-full"
                    style={{
                      width: `${
                        (meals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0) /
                          (userInfo?.goal_calories || 2200)) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
          </div>
  
        {/* 🔥 Makronährstoffe */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Carbs", color: "bg-green-400", goal: userInfo?.goal_carbs || 250, key: "total_carbs" },
            { label: "Protein", color: "bg-yellow-400", goal: userInfo?.goal_protein || 150, key: "total_protein" },
            { label: "Fat", color: "bg-purple-400", goal: userInfo?.goal_fat || 80, key: "total_fat" },
          ].map((macro, index) => (
            <div key={index} className="bg-gradient-to-br from-[#381b6b] to-[#1E1E1E] p-4 rounded-2xl shadow-lg">
              <p className="text-gray-400 text-xs">{macro.label}</p> {/* ❗Kleiner als vorher */}
              <p className="text-white text-base font-bold">
                {isNaN(meals.reduce((sum, meal) => sum + (meal[macro.key] || 0), 0))
                  ? 0
                  : meals.reduce((sum, meal) => sum + (meal[macro.key] || 0), 0)}
                <span className="text-gray-400 text-xs font-normal"> / {macro.goal || 0}g</span>
              </p>
              <div className="mt-2 h-2 bg-gray-700 rounded-full">
                <div
                  className={`h-2 ${macro.color} rounded-full`}
                  style={{
                    width: `${
                      (meals.reduce((sum, meal) => sum + (meal[macro.key] || 0), 0) / macro.goal) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
          <WaterTracker userId={user?.id} date={dashboardDate} /> 
        </div>
  
        {/* 🔥 Rechte Seite: Mahlzeitenübersicht */}
        <div className="space-y-6">
          {/* 🔍 Suchleiste */}
          <div className="relative bg-[#1A152A] p-5 rounded-2xl flex items-center shadow-lg">
            <FaSearch className="text-[#7E3AF2] text-lg ml-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-gray-300 placeholder-gray-500 ml-3 focus:outline-none flex-1"
            />
          </div>
  
{/* 🔥 Mahlzeiten-Übersicht - Desktop & Mobile Optimierung */}
<div className="space-y-6">
  {/* 📱 Mobile Ansicht: Alle Add-Buttons in einer Zeile */}
  <div className="flex sm:hidden justify-between gap-2">
    {[
      { name: "Add Breakfast", icon: "🥐", category: "breakfast" },
      { name: "Add Lunch", icon: "🍜", category: "lunch" },
      { name: "Add Dinner", icon: "🍔", category: "dinner" },
      { name: "Add Snacks", icon: "🍪", category: "snack" },
    ].map((meal, index) => (
      <button
        key={index}
        className="bg-[#1A152A] p-3 rounded-lg flex flex-col items-center justify-center shadow-md hover:bg-[#252033] transition w-full"
        onClick={() => openMealModal(meal.category)}
      >
        <span className="text-2xl">{meal.icon}</span>
        <span className="text-white text-xs mt-1">{meal.name}</span>
      </button>
    ))}
  </div>

{/* 📱 Today's Meals für Mobile */}
<div className="sm:hidden bg-[#1A152A] p-5 rounded-2xl shadow-lg mt-4">
  <h3 className="text-white-300 text-sm font-semibold mb-3">Today's Meals</h3>
  <div className="space-y-0">
    {meals.length > 0 ? (
      meals.map((meal, index) => (
        <div key={meal.id}>
          {/* Mahlzeit */}
          <div
            className="cursor-pointer p-3 hover:bg-[#2E294E] transition rounded-lg"
            onClick={() => setSelectedMeal(meal)} // ✅ Öffnet das MealDetailModal
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">{meal.meal_name}</p>
                <p className="text-gray-400 text-sm">{meal.total_calories} kcal</p>
              </div>
            </div>
          </div>

          {/* Trennlinie NUR zwischen Mahlzeiten */}
          {index < meals.length - 1 && (
            <div className="border-t border-gray-700 mx-2 my-2 opacity-50"></div>
          )}
        </div>
      ))
    ) : (
      <p className="text-gray-400 text-sm text-center">No meals logged yet.</p>
    )}
  </div>
</div>

  {/* 🖥 Desktop Ansicht */}
  <div className="hidden sm:grid grid-cols-2 gap-4">
    <div className="space-y-4">
      {[
        { name: "Add Breakfast", icon: "🥐", category: "breakfast", percentage: 0.25 },
        { name: "Add Lunch", icon: "🍜", category: "lunch", percentage: 0.35 },
        { name: "Add Dinner", icon: "🍔", category: "dinner", percentage: 0.30 },
        { name: "Add Snacks", icon: "🍪", category: "snack", percentage: 0.10 },
      ].map((meal, index) => {
        const totalCalories = userInfo?.goal_calories || 2200;
        const recommendedCalories = Math.round(meal.percentage * totalCalories);

        return (
          <div
            key={index}
            className="bg-[#1A152A] p-4 rounded-2xl flex items-center justify-between shadow-lg cursor-pointer hover:bg-[#252033] transition"
            onClick={() => openMealModal(meal.category)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-2xl">
                {meal.icon}
              </div>
              <div>
                <p className="text-white text-lg font-semibold">{meal.name}</p>
                <p className="text-gray-400 text-sm">Recommended | {recommendedCalories} kcal</p>
              </div>
            </div>
            <button className="text-[#7E3AF2] text-3xl">+</button>
          </div>
        );
      })}
    </div>

    {/* 🖥 Today's Meals für Desktop */}
    <div className="bg-[#1A152A] p-5 rounded-2xl shadow-lg">
      <h3 className="text-white-300 text-sm font-semibold mb-3">Today's Meals</h3>
      <div className="space-y-0">
        {meals.length > 0 ? (
          meals.map((meal, index) => (
            <div key={meal.id}>
              {/* Mahlzeit */}
              <div
                className="cursor-pointer p-3 hover:bg-[#2E294E] transition rounded-lg"
                onClick={() => setSelectedMeal(meal)} // ✅ Öffnet das MealDetailModal
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{meal.meal_name}</p>
                    <p className="text-gray-400 text-sm">{meal.total_calories} kcal</p>
                  </div>
                </div>
              </div>

              {/* Trennlinie NUR zwischen Mahlzeiten */}
              {index < meals.length - 1 && (
                <div className="border-t border-gray-700 mx-2 my-2 opacity-50"></div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center">No meals logged yet.</p>
        )}
      </div>
    </div>
  </div>
</div>
        </div>
      </section>
  
      {/* Modals */}
      {isMealOpen && (
        <MealModal 
            onClose={() => setIsMealOpen(false)} 
            initialCategory={selectedCategory} 
          />
        )}
    {selectedMeal && (
      <MealDetailModal
        meal={selectedMeal}
        setMeals={setMeals} // ✅ Wichtig für die Live-Aktualisierung
        onClose={() => setSelectedMeal(null)}
      />
    )}
      {isSetupRequired && <SetupModal />}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      {isCalendarOpen && (
        <CalendarModal
          onClose={(selectedDate) => {
            if (selectedDate) {
              setDashboardDate(new Date(selectedDate));
              fetchMealsByDate(selectedDate);
            }
            setIsCalendarOpen(false);
          }}
          setMeals={setMeals}
          initialDate={dashboardDate}
        />
      )}
  
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex justify-around">
      <NavIcon 
        icon={<FaHome />} 
        onClick={() => router.push("/dashboard")} 
        isActive={pathname === "/dashboard"} 
      />
      <NavIcon 
        icon={<FaRunning />} 
        isActive={pathname === "/workouts"} 
      />
      <NavIcon 
        icon={<FaCalendarAlt />} 
        onClick={() => setIsCalendarOpen(true)} 
        isActive={pathname === "/calendar"} 
      />
      <NavIcon 
        icon={<FaUser />} 
        isActive={pathname === "/profile"} 
      />
    </nav>
    </main>
  );
}

function NavIcon({ icon, onClick, isActive }) {
  return (
    <div className="relative flex items-center justify-center cursor-pointer transition" onClick={onClick}>
      {/* 🔥 Kreis für das aktive Element */}
      <div
        className={`w-16 h-16 flex items-center justify-center rounded-full transition text-2xl ${
          isActive ? "bg-[#7E3AF2] text-white" : "text-white hover:bg-gray-700"
        }`}
      >
        {icon}
      </div>

      {/* 🔥 Dünner violetter Rand um das aktive Element */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-18 h-18 rounded-full border-2 border-[#7E3AF2]"></div>
        </div>
      )}
    </div>
  );
}