"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function SetupModal() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("medium");
  const [stepGoal, setStepGoal] = useState(10000);
  const [goalType, setGoalType] = useState("maintain");
  const [dietType, setDietType] = useState("normal");
  const [error, setError] = useState(null);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleSave = async () => {
    const { data: userSession } = await supabase.auth.getSession();
    if (!userSession?.session) return;

    const user = userSession.session.user;

    const { error } = await supabase.from("users_info").insert([
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
      },
    ]);

    if (error) {
      setError(error.message);
      return;
    }

    location.reload(); // Reload Dashboard nach Speicherung
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
        </h2>

        <div className="space-y-3">
          {step === 1 && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}

          {step === 2 && (
            <input
              type="number"
              placeholder="Height (cm)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}

          {step === 3 && (
            <input
              type="number"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}

          {step === 4 && (
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="low">Low (sedentary)</option>
              <option value="medium">Medium (moderate activity)</option>
              <option value="high">High (very active)</option>
            </select>
          )}

          {step === 5 && (
            <input
              type="number"
              placeholder="Step Goal"
              value={stepGoal}
              onChange={(e) => setStepGoal(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}

          {step === 6 && (
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="normal">No Preference</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
            </select>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between">
            {step < 7 ? (
              <button
                onClick={handleNext}
                className="w-full bg-purple-600 py-3 rounded-lg text-white font-bold hover:bg-purple-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="w-full bg-green-600 py-3 rounded-lg text-white font-bold hover:bg-green-700 transition"
              >
                Save & Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}