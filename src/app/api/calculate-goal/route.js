import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Sicherstellen, dass API-Schlüssel gesetzt ist
});

export async function POST(req) {
  try {
    const { weight, height, activityLevel, goalType, dietType, extraInfo } = await req.json();

    // 🔍 Validierung der Eingaben
    if (!weight || !height || !activityLevel || !goalType || !dietType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 🧠 KI-Frage: Berechnung der Makronährstoffe
    const aiPrompt = `
      Based on the following user data:
      - Weight: ${weight} kg
      - Height: ${height} cm
      - Activity Level: ${activityLevel}
      - Goal Type: ${goalType}
      - Diet Type: ${dietType}

      Additional User Info: ${extraInfo || "No extra info provided"}

      Calculate the estimated daily:
      1. Total Calories (goal_calories)
      2. Protein Intake in grams (goal_protein)
      3. Carbohydrate Intake in grams (goal_carbs)
      4. Fat Intake in grams (goal_fat)
      
      Provide the results **only** in JSON format like this:
      {"goal_calories": 2300, "goal_protein": 150, "goal_carbs": 250, "goal_fat": 70}
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: aiPrompt }],
      temperature: 0.6,
    });

    const aiResult = JSON.parse(aiResponse.choices[0].message.content);

    // 🔹 Falls die KI nicht korrekt antwortet
    if (!aiResult.goal_calories || !aiResult.goal_protein || !aiResult.goal_carbs || !aiResult.goal_fat) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    // ✅ Erfolgreiche Berechnung -> Rückgabe der Werte
    return NextResponse.json(aiResult, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}