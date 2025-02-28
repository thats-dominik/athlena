"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export function MealModal({ onClose }) {
  const [mealName, setMealName] = useState("");
  const [mealCategory, setMealCategory] = useState("breakfast");
  const [foodItems, setFoodItems] = useState([]);
  const [showInputField, setShowInputField] = useState(false);
  const [imageFile, setImageFile] = useState(null); 
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFoodChange = (index, field, value) => {
    const updatedItems = [...foodItems];
    updatedItems[index][field] = value;
    setFoodItems(updatedItems);
  };


  const handleFileUpload = (event) => {
    setImageFile(event.target.files[0]); // ✅ Speichert das Bild

        // ✅ Prüft, ob das hochgeladene Bild ein JPG oder PNG ist
        if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
          setImageFile(file);
        } else {
          alert("Please upload a valid image (JPG or PNG)");
          setImageFile(null); // ❌ Setzt das Bild zurück, falls es ungültig ist
        }
  };

  

  const addFoodItem = () => {
    setFoodItems([...foodItems, { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }]);
  };

  const saveMeal = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.user) {
      alert("User not authenticated");
      return;
    }

    const user_id = user.user.id;
    const { error } = await supabase.from("meals").insert([
      {
        user_id,
        date: new Date().toISOString(),
        meal_name: mealName,
        meal_category: mealCategory,
        food_items: foodItems,
        total_calories: foodItems.reduce((sum, item) => sum + item.calories, 0),
        total_protein: foodItems.reduce((sum, item) => sum + item.protein, 0),
        total_carbs: foodItems.reduce((sum, item) => sum + item.carbs, 0),
        total_fat: foodItems.reduce((sum, item) => sum + item.fat, 0),
      },
    ]);

    if (error) {
      alert("Error saving meal");
      return;
    }

    onClose();
    location.reload();
  };

  const handleAskAI = () => {
    setShowInputField(true);
  };

  const submitAskAI = async () => {
    if (!inputText && !imageFile) {
      alert("Please enter a meal description or upload an image.");
      return;
    }
  
    setLoading(true);
  
    try {
      let response, data;
  
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        if (inputText) {
          formData.append("description", inputText);
        }
  
        formData.append("inputType", inputText ? "image_text" : "image");
  
        response = await fetch("/api/ask-ai", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/ask-ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputType: "text", inputData: inputText }),
        });
      }
  
      data = await response.json();
      setLoading(false);
  
      // 🛠 Debugging: Logge die gesamte Antwort von OpenAI im Terminal
      console.log("🔍 OpenAI API Response:", data);
  
      if (data.error || !data.meal) {
        alert("AI did not return a valid meal analysis.");
        return;
      }
      
      // Falls OpenAI ein einzelnes Objekt zurückgibt, konvertiere es in ein Array
      const mealData = Array.isArray(data.meal) ? data.meal : [data.meal];
      
      setFoodItems(
        mealData.map((item) => ({
          name: item.foodName && item.foodName.trim() !== "" ? item.foodName : `Generated Meal ${index + 1}`,
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
        }))
      );
  
      setShowInputField(false);
    } catch (error) {
      setLoading(false);
      console.error("❌ Error while processing AI request:", error);
      alert("❌ Error: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
<div className="bg-gray-900 p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-blue-400 mb-4">Log your meal</h2>

        <label className="text-gray-400 text-sm">Meal Name</label>
        <input
          type="text"
          placeholder="Meal name (e.g. Omelette)"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        />

        <label className="text-gray-400 text-sm">Meal Category</label>
        <select
          value={mealCategory}
          onChange={(e) => setMealCategory(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>

        {foodItems.map((item, index) => (
          <div key={index} className="mb-4 p-2 bg-gray-800 rounded-lg">
            <label className="text-gray-400 text-sm">Food Name</label>
            <input
              type="text"
              placeholder="Food name"
              value={item.name}
              onChange={(e) => handleFoodChange(index, "name", e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white mb-1"
            />

            <label className="text-gray-400 text-sm">Calories</label>
            <input
              type="number"
              placeholder="Calories"
              value={item.calories}
              onChange={(e) => handleFoodChange(index, "calories", parseFloat(e.target.value) || 0)}
              className="w-full p-2 rounded bg-gray-700 text-white mb-1"
            />

            <label className="text-gray-400 text-sm">Protein (g)</label>
            <input
              type="number"
              placeholder="Protein (g)"
              value={item.protein}
              onChange={(e) => handleFoodChange(index, "protein", parseFloat(e.target.value) || 0)}
              className="w-full p-2 rounded bg-gray-700 text-white mb-1"
            />

            <label className="text-gray-400 text-sm">Carbs (g)</label>
            <input
              type="number"
              placeholder="Carbs (g)"
              value={item.carbs}
              onChange={(e) => handleFoodChange(index, "carbs", parseFloat(e.target.value) || 0)}
              className="w-full p-2 rounded bg-gray-700 text-white mb-1"
            />

            <label className="text-gray-400 text-sm">Fat (g)</label>
            <input
              type="number"
              placeholder="Fat (g)"
              value={item.fat}
              onChange={(e) => handleFoodChange(index, "fat", parseFloat(e.target.value) || 0)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
        ))}

        <button onClick={addFoodItem} className="text-blue-400 mt-2">+ Add Food</button>

        <button onClick={handleAskAI} className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 w-full mt-4">
          Ask AI 🔍
        </button>

        {showInputField && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white mb-2">Enter Meal Description</h3>

                  {/* ✅ Bild-Upload-Feld */}
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white mb-2">Upload a Meal Image (Optional)</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          {imageFile && <p className="text-green-400 text-sm mt-2">Image selected: {imageFile.name}</p>}
        </div>

        {/* ✅ Textfeld für Mahlzeitenbeschreibung */}
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white mb-2">Enter Meal Description</h3>
          <input
            type="text"
            placeholder="Enter meal description"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-2 mt-2 rounded bg-gray-800 text-white"
          />
        </div>

            <button 
              onClick={submitAskAI} 
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 w-full mt-4"
              disabled={loading}
            >
              {loading ? "🔄 Processing..." : "🚀 Submit"}
            </button>
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">Cancel</button>
          <button onClick={saveMeal} className="px-4 py-2 bg-purple-500 rounded hover:bg-purple-600">Save Meal</button>
        </div>
      </div>
    </div>
  );
}