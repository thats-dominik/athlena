"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export function MealModal({ onClose, initialCategory }) {
  const [mealName, setMealName] = useState("");
  const [mealCategory, setMealCategory] = useState(initialCategory || "Breakfast");
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

  const [gradientPos, setGradientPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth) * 100;
    const y = (clientY / window.innerHeight) * 100;
    setGradientPos({ x, y });
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
  
    setMeals(data || []);
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
    if (!mealName.trim()) { // ❌ Falls der Name leer ist
      alert("Please enter a meal name before saving.");
      return;
    }
  
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
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onClick={onClose}
    >
      <div
        className="p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto shadow-lg transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${gradientPos.x}% ${gradientPos.y}%, #2E1A47, #1d0d33)`,
          boxShadow: "0px 10px 30px rgba(126, 58, 242, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-blue-400 mb-4">Log your meal</h2>
  
        <label className="text-gray-400 text-sm">Meal Name</label>
          <input
            type="text"
            placeholder="Meal name (e.g. Omelette)"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="mb-2 mt-1 w-full p-2 rounded-lg bg-[#1d0d33] text-white border border-gray-500 focus:border-white outline-none transition"
          />

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
  
          {foodItems.map((item, index) => (
            <div key={index} className="mt-4 mb-4 p-4 bg-[#1d0d33] rounded-lg border border-gray-600 shadow-md">
              <label className="text-gray-400 text-sm">Food / Ingredient Name</label>
              <input
                type="text"
                placeholder="Food name"
                value={item.name}
                onChange={(e) => handleFoodChange(index, "name", e.target.value)}
                className="mb-2 mt-1 w-full p-2 rounded-lg bg-[#170928] text-white border border-gray-500 focus:border-white focus:ring-2 focus:ring-[#7E3AF2] outline-none transition"
              />

              <label className="text-gray-400 text-sm mt-2 block">Calories</label>
              <input
                type="number"
                placeholder="Calories"
                value={item.calories}
                onChange={(e) => handleFoodChange(index, "calories", parseFloat(e.target.value) || 0)}
                className="mb-2 mt-1 w-full p-2 rounded-lg bg-[#170928] text-white border border-gray-500 focus:border-white focus:ring-2 focus:ring-[#7E3AF2] outline-none transition"
              />

              <label className="text-gray-400 text-sm mt-2 block">Protein (g)</label>
              <input
                type="number"
                placeholder="Protein (g)"
                value={item.protein}
                onChange={(e) => handleFoodChange(index, "protein", parseFloat(e.target.value) || 0)}
                className="mb-2 mt-1 w-full p-2 rounded-lg bg-[#170928] text-white border border-gray-500 focus:border-white focus:ring-2 focus:ring-[#7E3AF2] outline-none transition"
              />

              <label className="text-gray-400 text-sm mt-2 block">Carbs (g)</label>
              <input
                type="number"
                placeholder="Carbs (g)"
                value={item.carbs}
                onChange={(e) => handleFoodChange(index, "carbs", parseFloat(e.target.value) || 0)}
                className="mb-2 mt-1 w-full p-2 rounded-lg bg-[#170928] text-white border border-gray-500 focus:border-white focus:ring-2 focus:ring-[#7E3AF2] outline-none transition"
              />

              <label className="text-gray-400 text-sm mt-2 block">Fat (g)</label>
              <input
                type="number"
                placeholder="Fat (g)"
                value={item.fat}
                onChange={(e) => handleFoodChange(index, "fat", parseFloat(e.target.value) || 0)}
                className="mt-1 w-full p-2 rounded-lg bg-[#170928] text-white border border-gray-500 focus:border-white focus:ring-2 focus:ring-[#7E3AF2] outline-none transition"
              />
            </div>
          ))}
  
          <div className="flex justify-between mt-2">
          <button onClick={addFoodItem} className="text-blue-400">+ Add Food</button>
          <button 
            onClick={() => setFoodItems(foodItems.slice(0, -1))} 
            className="text-red-400 hover:text-red-500 transition"
          >
            Remove Food –
          </button>
        </div>
  
        <button
          onClick={() => setShowInputField((prev) => !prev)}
          className="relative h-12 px-8 rounded-lg overflow-hidden transition-all duration-500 group w-full mt-4"
        >
          <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-b from-[#654358] via-[#17092A] to-[#2F0D64]">
            <div className="absolute inset-0 bg-[#170928] rounded-lg opacity-90"></div>
          </div>
          <div className="absolute inset-[2px] bg-[#170928] rounded-lg opacity-95"></div>
          <div className="absolute inset-[2px] bg-gradient-to-r from-[#170928] via-[#1d0d33] to-[#170928] rounded-lg opacity-90"></div>
          <div className="absolute inset-[2px] bg-gradient-to-b from-[#654358]/40 via-[#1d0d33] to-[#2F0D64]/30 rounded-lg opacity-80"></div>
          <div className="absolute inset-[2px] bg-gradient-to-br from-[#C787F6]/10 via-[#1d0d33] to-[#2A1736]/50 rounded-lg"></div>
          <div className="absolute inset-[2px] shadow-[inset_0_0_15px_rgba(199,135,246,0.15)] rounded-lg"></div>
          
          <div className="relative flex items-center justify-center gap-2">
            <span className="text-lg font-normal bg-white bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(199,135,246,0.4)] tracking-tighter">
              {showInputField ? "Close Ask AI 🔍" : "Ask AI 🔍"}
            </span>
          </div>

          <div className="absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 group-hover:opacity-100 rounded-lg"></div>
        </button>
  
        {showInputField && (
          <div className="mt-4 space-y-4">
            {/* ✅ Upload Image */}
            <div>
              <h3 className="mb-2 text-gray-400 text-sm">Upload a Meal Image (Optional)</h3>
              <label className="flex items-center justify-center w-full h-12 border border-gray-500 border-dashed rounded-lg cursor-pointer transition hover:border-white">
                <span className="text-gray-400 text-base">Choose file...</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              {imageFile && (
                <div className="relative mt-2 group flex items-center">
                  <p className="text-green-400 text-xs">{imageFile.name}</p>
                  <button
                    onClick={() => setImageFile(null)}
                    className="ml-2 text-red-500 hover:text-red-700 transition"
                  >
                    ❌
                  </button>
                </div>
              )}
            </div>

            {/* ✅ Description Input */}
            <div>
              <h3 className="mb-2 text-gray-400 text-sm">Enter Meal Description</h3>
              <input
                type="text"
                placeholder="e.g. Grilled chicken with vegetables"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#1d0d33] text-white border border-gray-500 focus:border-white outline-none transition"
              />
            </div>

            {/* ✅ Submit Button mit Fly-Away Rocket Animation */}
            <button
              onClick={submitAskAI}
              className="relative flex items-center justify-center w-full px-4 py-2 rounded-lg transition group overflow-hidden"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #e63946, #b71c1c)",
                boxShadow: "0px 4px 15px rgba(230, 57, 70, 0.4)",
              }}
            >
              {loading ? "🔄 Processing..." : (
                <>
                  <span className="relative">🚀 Submit</span>
                </>
              )}
            </button>
          </div>
        )}
  
          <div className="mt-4 flex gap-4">
          <button 
            onClick={onClose} 
            className="w-1/2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={saveMeal}
            className="w-1/2 px-4 py-2 rounded transition"
            style={{
              background: "linear-gradient(135deg, #7E3AF2, #4A2373)",
            }}
          >
            Save Meal
          </button>
        </div>
      </div>
    </div>
  );
}