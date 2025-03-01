"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/app/styles/calendar.css";

export default function CalendarModal({ onClose, setMeals, initialDate }) {
  // 🛠 Sicherstellen, dass initialDate ein Date-Objekt ist
  const [selectedDate, setSelectedDate] = useState(
    initialDate instanceof Date ? initialDate : new Date(initialDate)
  );
  const [availableDates, setAvailableDates] = useState(new Set());
  const [archivedMeals, setArchivedMeals] = useState([]);

  useEffect(() => {
    fetchMealDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchMealsByDate(selectedDate);
    }
  }, [selectedDate]);

  // 📅 Holt alle verfügbaren Mahlzeiten-Tage
  const fetchMealDates = async () => {
    const { data, error } = await supabase.from("meals").select("date");

    if (error) {
      console.error("❌ Error fetching meal dates:", error);
      return;
    }

    // 🔥 Stelle sicher, dass wir nur das Datum speichern, ohne Zeitzonenprobleme
    const dates = new Set(
      data.map((entry) => new Date(entry.date).toISOString().split("T")[0])
    );
    setAvailableDates(dates);
  };

  const [gradientPos, setGradientPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth) * 100;
    const y = (clientY / window.innerHeight) * 100;
    setGradientPos({ x, y });
  };


  // 🥗 Holt Mahlzeiten für das gewählte Datum
  const fetchMealsByDate = async (date) => {
    if (!date) return;

    // 🛠 Stelle sicher, dass `date` ein Date-Objekt ist
    const formattedDate = date instanceof Date ? date : new Date(date);

    formattedDate.setHours(12, 0, 0, 0); // 🔥 Verhindert UTC-Verschiebung
    const dateString = formattedDate.toISOString().split("T")[0];

    console.log("🔄 Fetching meals for date:", dateString);

    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("date", dateString);

    if (error) {
      console.error("❌ Error fetching archived meals:", error);
      return;
    }

    setArchivedMeals(data);
    if (typeof setMeals === "function") {
      setMeals(data);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onMouseMove={handleMouseMove}
    >
      <div
        className="p-6 rounded-lg shadow-lg w-[400px] transition-all duration-300 border border-gray-700"
        style={{
          background: `radial-gradient(circle at ${gradientPos.x}% ${gradientPos.y}%, #2E1A47, #1d0d33)`,
          boxShadow: "0px 10px 30px rgba(126, 58, 242, 0.3)",
        }}
      >
        {/* Header */}
        <h2 className="text-lg font-bold text-center mb-4 flex items-center gap-2 text-white">
          📅 Select a Date
        </h2>

        {/* Kalender Wrapper */}
        <div className="p-4 bg-[#170928] rounded-lg shadow-inner">
          <Calendar
            onChange={(date) => {
              const formattedDate = new Date(date);
              formattedDate.setHours(12, 0, 0, 0);
              setSelectedDate(formattedDate);
            }}
            value={selectedDate}
            tileClassName={({ date }) =>
              availableDates.has(date.toISOString().split("T")[0])
                ? "react-calendar__tile--meal"
                : ""
            }
            className="w-full bg-transparent text-white p-2 rounded-lg"
          />
        </div>

        {/* Archivierte Mahlzeiten */}
        <div className="mt-4 max-h-40 overflow-y-auto">
          {archivedMeals.length > 0 ? (
            archivedMeals.map((meal) => (
              <div
                key={meal.id}
                className="p-3 bg-[#1d0d33] rounded mt-2 flex justify-between items-center border border-gray-600 shadow-md hover:shadow-lg transition-shadow"
              >
                <p className="font-bold text-white">{meal.meal_name}</p>
                <p className="text-sm text-gray-400">{meal.total_calories} kcal</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm text-center">No meals for this day.</p>
          )}
        </div>

        {/* Close-Button mit verbessertem Gradient */}
        <button
          className="w-full mt-4 py-2 rounded-lg text-white font-semibold transition transform hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #e63946, #b71c1c)",
            boxShadow: "0px 4px 15px rgba(230, 57, 70, 0.4)",
          }}
          onClick={() => {
            const formattedDate = selectedDate.toISOString().split("T")[0];
            fetchMealsByDate(formattedDate);
            onClose(formattedDate);
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}