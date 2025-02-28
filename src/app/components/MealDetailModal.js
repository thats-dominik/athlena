"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function MealDetailModal({ meal, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [mealName, setMealName] = useState(meal?.meal_name || "");
  const [mealCategory, setMealCategory] = useState(meal?.meal_category || "breakfast"); // ✅ NEU: Kategorie bearbeiten
  const [foodItems, setFoodItems] = useState(meal?.food_items || []);

  useEffect(() => {
    if (meal) {
      setIsVisible(true);
      document.body.style.overflow = "hidden"; // ✅ Scrollen der Hauptseite deaktivieren
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

  // ✅ Handler für Food Item Änderungen
  const handleFoodChange = (index, field, value) => {
    const updatedItems = [...foodItems];
    updatedItems[index][field] = value;
    setFoodItems(updatedItems);
  };

  // ✅ Speichert die Änderungen in Supabase
  const saveChanges = async () => {
    if (!meal) return;

    const { error } = await supabase
      .from("meals")
      .update({
        meal_name: mealName,
        meal_category: mealCategory, // ✅ NEU: Kategorie wird gespeichert
        food_items: foodItems,
        total_calories: foodItems.reduce((sum, item) => sum + item.calories, 0),
        total_protein: foodItems.reduce((sum, item) => sum + item.protein, 0),
        total_carbs: foodItems.reduce((sum, item) => sum + item.carbs, 0),
        total_fat: foodItems.reduce((sum, item) => sum + item.fat, 0),
      })
      .eq("id", meal.id);

    if (error) {
      alert("Error saving meal");
      return;
    }

    onClose(); // ✅ Modal schließen nach Speichern
  };

  if (!meal) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center transition-opacity ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeModal}
    >
      <div
        className="bg-gray-900 p-6 rounded-lg w-96 max-w-full max-h-[80vh] overflow-y-auto relative shadow-lg transform transition-transform scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-blue-400 mb-4">Edit Meal</h2>

        {/* ✅ Meal Name Bearbeiten */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm">Meal Name</label>
          <input
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        {/* ✅ NEU: Mahlzeitenkategorie ändern */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm">Meal Category</label>
          <select
            value={mealCategory}
            onChange={(e) => setMealCategory(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        {/* ✅ Food Items Liste */}
        {foodItems.length > 0 ? (
          foodItems.map((item, index) => (
            <div key={index} className="bg-gray-800 p-2 rounded-lg mt-2">
              <label className="text-gray-400 text-sm">Food Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleFoodChange(index, "name", e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white mb-1"
              />

              <label className="text-gray-400 text-sm">Calories</label>
              <input
                type="number"
                value={item.calories}
                onChange={(e) => handleFoodChange(index, "calories", parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded bg-gray-700 text-white mb-1"
              />

              <label className="text-gray-400 text-sm">Protein (g)</label>
              <input
                type="number"
                value={item.protein}
                onChange={(e) => handleFoodChange(index, "protein", parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded bg-gray-700 text-white mb-1"
              />

              <label className="text-gray-400 text-sm">Carbs (g)</label>
              <input
                type="number"
                value={item.carbs}
                onChange={(e) => handleFoodChange(index, "carbs", parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded bg-gray-700 text-white mb-1"
              />

              <label className="text-gray-400 text-sm">Fat (g)</label>
              <input
                type="number"
                value={item.fat}
                onChange={(e) => handleFoodChange(index, "fat", parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No food items available.</p>
        )}

        {/* ✅ Speichern & Schließen Buttons */}
        <div className="mt-4 flex justify-between">
          <button onClick={closeModal} className="px-4 py-2 bg-gray-700 rounded">Cancel</button>
          <button onClick={saveChanges} className="px-4 py-2 bg-green-500 rounded hover:bg-green-600">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}