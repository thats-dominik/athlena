"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function WaterTracker({ userId, date }) {
  const [waterIntake, setWaterIntake] = useState(0);
  const [visibleGlasses, setVisibleGlasses] = useState(5);
  const glassSize = 250;
  const glassesPerRow = 8;

  useEffect(() => {
    if (!userId || !date) return;
    fetchWaterIntake();
  }, [userId, date]);

  const fetchWaterIntake = async () => {
    try {
      if (!userId || !date) return;

      const formattedDate = new Date(date).toISOString().split("T")[0];

      console.log(`🔄 Fetching water intake for: ${formattedDate}`);

      const { data, error } = await supabase
        .from("water_intake")
        .select("water_ml")
        .eq("user_id", userId)
        .eq("date", formattedDate)
        .maybeSingle();

      if (error) {
        console.error("❌ Error fetching water intake:", error);
        return;
      }

      const newWaterIntake = data?.water_ml || 0;
      setWaterIntake(newWaterIntake);

      const requiredGlasses = Math.ceil(newWaterIntake / glassSize) + 2;
      setVisibleGlasses(Math.max(5, requiredGlasses));
    } catch (err) {
      console.error("❌ Unexpected error fetching water intake:", err);
    }
  };

  const updateWaterIntake = async (newAmount) => {
    try {
      const formattedDate = new Date(date).toISOString().split("T")[0];

      console.log(`🔄 Updating water intake for ${formattedDate} to ${newAmount} ml`);

      const { data, error: fetchError } = await supabase
        .from("water_intake")
        .select("water_ml")
        .eq("user_id", userId)
        .eq("date", formattedDate)
        .maybeSingle();

      if (fetchError) {
        console.error("❌ Error checking existing entry:", fetchError);
        return;
      }

      if (data) {
        const { error: updateError } = await supabase
          .from("water_intake")
          .update({ water_ml: newAmount })
          .eq("user_id", userId)
          .eq("date", formattedDate);

        if (updateError) {
          console.error("❌ Error updating water intake:", updateError);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from("water_intake")
          .insert([{ user_id: userId, date: formattedDate, water_ml: newAmount }]);

        if (insertError) {
          console.error("❌ Error inserting new water intake:", insertError);
          return;
        }
      }

      setWaterIntake(newAmount);
      setVisibleGlasses((prev) => Math.max(prev, Math.ceil(newAmount / glassSize) + 2));
    } catch (err) {
      console.error("❌ Unexpected error updating water intake:", err);
    }
  };

  const handleGlassClick = (index) => {
    const clickedAmount = (index + 1) * glassSize;

    if (clickedAmount === waterIntake) {
      updateWaterIntake(index * glassSize);
    } else {
      updateWaterIntake(clickedAmount);
    }
  };
// bg-[#1E1E1E]
  return (
    <div className="bg-gradient-to-tr from-[#381b6b] to-[#1E1E1E] p-6 rounded-2xl shadow-lg">
      <h2 className="text-base text-white-300 font-semibold mb-1">Water Intake</h2>
      <p className="text-gray-300 text-sm mb-3">{waterIntake} ml</p>

{/* 🔥 Dynamische Gläser UI (Grid mit max. 8 Spalten, 4 auf Mobile) */}
<div className="grid gap-4 sm:gap-10 max-w-[calc(8*4rem+7*10px)] grid-cols-5 sm:grid-cols-8">
  {[...Array(visibleGlasses)].map((_, index) => {
    const isFilled = (index + 1) * glassSize <= waterIntake;

    return (
      <div
        key={index}
        onClick={() => handleGlassClick(index)}
        className="relative cursor-pointer flex items-end overflow-hidden"
        style={{
          width: "3.75rem", // ⬆️ Größer für Mobile
          height: "4.5rem", // ⬆️ Größer für Mobile
          background: "transparent",
          borderBottom: "0.25rem solid white",
          borderLeft: "0.25rem solid white",
          borderRight: "0.25rem solid white",
          borderTop: "none",
        }}
      >
        {/* Wasserfüllung */}
        <div
          style={{
            width: "100%",
            height: isFilled ? "100%" : "0%",
            background: "linear-gradient(to bottom, #7E3AF2,rgb(74, 32, 136))",
            transition: "height 0.3s ease-in-out",
            boxShadow: "0px 0px 12px 4px rgba(126, 58, 242, 0.5), 0px 0px 20px 6px rgba(176, 132, 244, 0.4)",
          }}
        />
      </div>
    );
  })}
</div>
    </div>
  );
}