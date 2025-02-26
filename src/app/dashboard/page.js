"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import SetupModal from "@/app/components/SetupModal";
import { FiSettings } from "react-icons/fi";
import { FaHome, FaUtensils, FaRunning, FaUser } from "react-icons/fa";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [meals, setMeals] = useState([]);
  const [weekStats, setWeekStats] = useState([]);
  const [isSetupRequired, setIsSetupRequired] = useState(false);

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
      .select("*")
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching meals:", error);
      return;
    }

    setMeals(data || []);
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
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Header with profile */}
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
        <FiSettings className="text-xl text-gray-400 hover:text-white cursor-pointer" />
      </header>

      {/* Calories Overview */}
      <section className="p-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
          <h2 className="text-lg font-bold mb-4">calories overview</h2>
          <div className="relative w-32 h-32 bg-gray-700 rounded-full flex flex-col items-center justify-center text-xl font-bold">
            <p>{meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal</p>
            <p className="text-sm text-gray-400">/ {userInfo?.goal_calories || 2200} kcal</p>
          </div>
        </div>
      </section>

      {/* Today's Meals */}
      <section className="p-6">
        <h2 className="text-lg font-bold mb-4">today's meals</h2>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          {meals.length > 0 ? (
            meals.map((meal, index) => (
              <div
                key={index}
                className="flex justify-between border-b border-gray-700 py-2"
              >
                <div>
                  <p className="font-bold">{meal.name}</p>
                  <p className="text-sm text-gray-400">{meal.details}</p>
                </div>
                <p className="text-lg font-bold">{meal.calories} kcal</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">no meals logged yet.</p>
          )}
        </div>
      </section>

      {/* User Data Setup Modal */}
      {isSetupRequired && <SetupModal />}

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex justify-around">
        <NavIcon icon={<FaHome />} />
        <NavIcon icon={<FaUtensils />} />
        <NavIcon icon={<FaRunning />} />
        <NavIcon icon={<FaUser />} />
      </nav>
    </main>
  );
}

// Navigation Icon Component
function NavIcon({ icon }) {
  return (
    <div className="text-white text-2xl p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
      {icon}
    </div>
  );
}