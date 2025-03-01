"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function MealDetailModal({ meal, onClose, setMeals }) {
  const [isVisible, setIsVisible] = useState(false);
  const [mealName, setMealName] = useState(meal?.meal_name || "");
  const [mealCategory, setMealCategory] = useState(meal?.meal_category || "breakfast");
  const [foodItems, setFoodItems] = useState(meal?.food_items || []);
  const [gradientPos, setGradientPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (meal) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [meal]);

  const closeModal = () => {
    setIsVisible(false);
    setTimeout(onClose, 150);
  };

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth) * 100;
    const y = (clientY / window.innerHeight) * 100;
    setGradientPos({ x, y });
  };

  const handleFoodChange = (index, field, value) => {
    const updatedItems = [...foodItems];
    updatedItems[index][field] = value;
    setFoodItems(updatedItems);
  };

  const saveChanges = async () => {
    if (!meal) return;
  
    const updatedMeal = {
      ...meal,
      meal_name: mealName,
      meal_category: mealCategory,
      food_items: foodItems,
      total_calories: foodItems.reduce((sum, item) => sum + item.calories, 0),
      total_protein: foodItems.reduce((sum, item) => sum + item.protein, 0),
      total_carbs: foodItems.reduce((sum, item) => sum + item.carbs, 0),
      total_fat: foodItems.reduce((sum, item) => sum + item.fat, 0),
    };
  
    const { error } = await supabase
      .from("meals")
      .update(updatedMeal)
      .eq("id", meal.id);
  
    if (error) {
      alert("Error saving meal");
      return;
    }
  
    // ✅ Aktualisiert die Meal-Liste ohne Reload
    if (setMeals) {
      setMeals((prevMeals) =>
        prevMeals.map((m) => (m.id === meal.id ? updatedMeal : m))
      );
    }
  
    closeModal();
  };

  // ✅ Mahlzeit löschen
  const deleteMeal = async () => {
    if (!meal) return;

    const { error } = await supabase.from("meals").delete().eq("id", meal.id);

    if (error) {
      alert("Error deleting meal");
      return;
    }

    // ✅ Entferne die Mahlzeit aus der Liste
    if (setMeals) {
      setMeals((prevMeals) => prevMeals.filter((m) => m.id !== meal.id));
    }

    closeModal();
  };

  if (!meal) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onClick={closeModal}
    >
      <div
        className="p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto shadow-lg transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${gradientPos.x}% ${gradientPos.y}%, #2E1A47, #1d0d33)`,
          boxShadow: "0px 10px 30px rgba(126, 58, 242, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-blue-400 mb-4">Edit Meal</h2>

        {/* ✅ Meal Name */}
        <label className="text-gray-400 text-sm">Meal Name</label>
        <input
          type="text"
          placeholder="Meal name (e.g. Omelette)"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="mb-2 mt-1 w-full p-2 rounded-lg bg-[#1d0d33] text-white border border-gray-500 focus:border-white outline-none transition"
        />

        {/* ✅ Meal Category */}
        <label className="text-gray-400 text-sm">Meal Category</label>
        <select
          value={mealCategory}
          onChange={(e) => setMealCategory(e.target.value)}
          className="mb-2 mt-1 w-full p-2 rounded-lg bg-[#1d0d33] text-white border border-gray-500 focus:border-white outline-none transition"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>

        {/* ✅ Food Items List */}
        {foodItems.map((item, index) => (
          <div key={index} className="mt-4 mb-4 p-4 bg-[#1d0d33] rounded-lg border border-gray-600 shadow-md">
            <label className="text-gray-400 text-sm">Food / Ingredient Name</label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => handleFoodChange(index, "name", e.target.value)}
              className="mb-2 mt-1 w-full p-2 rounded-lg bg-[#170928] text-white border border-gray-500 focus:border-white outline-none transition"
            />

            <label className="text-gray-400 text-sm">Calories</label>
            <input
              type="number"
              value={item.calories}
              onChange={(e) => handleFoodChange(index, "calories", parseFloat(e.target.value) || 0)}
              className="mb-2 mt-1 w-full p-2 rounded-lg bg-[#170928] text-white border border-gray-500 focus:border-white outline-none transition"
            />

            <label className="text-gray-400 text-sm">Protein (g)</label>
            <input
              type="number"
              value={item.protein}
              onChange={(e) => handleFoodChange(index, "protein", parseFloat(e.target.value) || 0)}
              className="mb-2 mt-1 w-full p-2 rounded-lg bg-[#170928] text-white border border-gray-500 focus:border-white outline-none transition"
            />

            <label className="text-gray-400 text-sm">Carbs (g)</label>
            <input
              type="number"
              value={item.carbs}
              onChange={(e) => handleFoodChange(index, "carbs", parseFloat(e.target.value) || 0)}
              className="mb-2 mt-1 w-full p-2 rounded-lg bg-[#170928] text-white border border-gray-500 focus:border-white outline-none transition"
            />
          </div>
        ))}

        {/* ✅ Buttons */}
        <div className="mt-4 flex gap-4">
          <button onClick={deleteMeal} className="w-1/3 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition">Delete</button>
          <button onClick={onClose} className="w-1/3 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition">Cancel</button>
          <button onClick={saveChanges} className="w-1/3 px-4 py-2 bg-[#7E3AF2] rounded hover:bg-[#4A2373] transition">Save</button>
        </div>
      </div>
    </div>
  );
}