"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function SetupModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [stepGoal, setStepGoal] = useState(10000);
  const [goalType, setGoalType] = useState("maintain");
  const [dietType, setDietType] = useState("normal");
  const [extraInfo, setExtraInfo] = useState(""); // 🆕 Neues Feld für zusätzliche Infos
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch("/api/calculate-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight,
          height,
          activityLevel,
          goalType,
          dietType,
          extraInfo, // 🆕 Senden des neuen Feldes
        }),
      });

      const data = await response.json();
      if (data.error) {
        setError("AI calculation failed. Try again.");
        setIsCalculating(false);
        return;
      }

      // Speichert die berechneten Werte in Supabase
      await saveUserData(data.goal_calories, data.goal_protein, data.goal_carbs, data.goal_fat);
    } catch (error) {
      setError("An error occurred while calculating.");
    } finally {
      setIsCalculating(false);
    }
  };

  const saveUserData = async (goalCalories, goalProtein, goalCarbs, goalFat) => {
    const { data: userSession } = await supabase.auth.getSession();
    if (!userSession?.session) return;

    const user = userSession.session.user;

    const { error } = await supabase.from("users_info").upsert([
      {
        id: user.id,
        email: user.email,
        full_name: fullName,
        height_cm: height,
        weight_kg: weight,
        activity_level: activityLevel,
        step_goal: stepGoal,
        goal_type: goalType,
        diet_type: dietType,
        goal_calories: goalCalories,
        goal_protein: goalProtein,
        goal_carbs: goalCarbs,
        goal_fat: goalFat,
        extra_info: extraInfo, 
      },
    ]);

    if (error) {
      setError("Error saving data.");
    } else {
      location.reload(); // 🔄 Dashboard neu laden
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold text-center text-white mb-4">
          {step === 1 && "Enter your Full Name"}
          {step === 2 && "Your Height"}
          {step === 3 && "Your Weight"}
          {step === 4 && "Activity Level"}
          {step === 5 && "Daily Step Goal"}
          {step === 6 && "Your Goal Type"}
          {step === 7 && "Diet Preference"}
          {step === 8 && "Additional Information"} {/* 🆕 Neuer 8. Schritt */}
        </h2>

        <div className="space-y-3">
          {step === 1 && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          )}

          {step === 2 && (
            <input
              type="number"
              placeholder="Height (cm)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          )}

          {step === 3 && (
            <input
              type="number"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          )}

          {step === 4 && (
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="sedentary">Sedentary (little to no exercise)</option>
              <option value="light">Light (light exercise 1-3 days per week)</option>
              <option value="moderate">Moderate (moderate exercise 3-5 days per week)</option>
              <option value="active">Active (hard exercise 6-7 days per week)</option>
              <option value="athlete">Athlete (very intense training daily)</option>
            </select>
          )}

          {step === 5 && (
            <input
              type="number"
              placeholder="Step Goal"
              value={stepGoal}
              onChange={(e) => setStepGoal(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          )}

          {step === 6 && (
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="maintain">Maintain Weight</option>
              <option value="lose_weight">Lose Weight</option>
              <option value="muscle_gain">Muscle Gain</option>
            </select>
          )}

          {step === 7 && (
            <select
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="normal">No Preference</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
            </select>
          )}
                    {step === 8 && ( // 🆕 Neuer 8. Step
            <textarea
              placeholder="Additional info (e.g., I go to the gym 4x a week, I have a high-protein diet...)"
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 h-24"
            ></textarea>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between">
            {step < 8 ? (
              <button
                onClick={handleNext}
                className="w-full bg-gray-600 py-3 rounded-lg text-white font-bold hover:bg-gray-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 py-3 rounded-lg text-white font-bold hover:bg-blue-700 transition"
                disabled={isCalculating}
              >
                {isCalculating ? "Calculating..." : "Calculate"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}