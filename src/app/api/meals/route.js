import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req) {
  try {
    const { user_id, meal_name, food_items } = await req.json();

    if (!user_id || !meal_name || !food_items || food_items.length === 0) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Berechnung der Gesamtnährwerte
    let total_calories = 0;
    let total_protein = 0;
    let total_carbs = 0;
    let total_fat = 0;

    food_items.forEach(item => {
      total_calories += item.calories || 0;
      total_protein += item.protein || 0;
      total_carbs += item.carbs || 0;
      total_fat += item.fat || 0;
    });

    // Speichern in die Supabase-Datenbank
    const { data, error } = await supabase
      .from("meals")
      .insert([
        {
          user_id,
          date: new Date().toISOString(), // Timestamp hinzufügen
          meal_name,
          food_items,
          total_calories,
          total_protein,
          total_carbs,
          total_fat
        }
      ]);

    if (error) {
      console.error("Database Error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Meal saved successfully", data }), { status: 200 });
  } catch (err) {
    console.error("Server Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}