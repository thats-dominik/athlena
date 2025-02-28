import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    let inputType, inputData, imageFile;

    const contentType = req.headers.get("content-type");

    if (contentType.includes("application/json")) {
      const body = await req.json();
      inputType = body.inputType;
      inputData = body.inputData;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      inputType = formData.get("inputType");
      inputData = formData.get("description") || ""; // Optional: Beschreibung zum Bild
      imageFile = formData.get("image");
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    if (!inputType || (!inputData && !imageFile)) {
      return NextResponse.json({ error: "Missing input data" }, { status: 400 });
    }

    // ✅ Falls ein Bild hochgeladen wurde, in Base64 umwandeln
    let base64Image = null;
    if (imageFile) {
      const buffer = await imageFile.arrayBuffer();
      base64Image = `data:${imageFile.type};base64,${Buffer.from(buffer).toString("base64")}`;
    }

    let parsedData;

// 🖼 Falls ein Bild vorhanden ist, analysiere es mit OpenAI Vision
if (imageFile) {
  console.log("🔍 Image detected - Sending to OpenAI Vision API...");

  const visionResponse = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { 
        role: "system", 
        content: `You are a nutrition analysis assistant. 
        You MUST ONLY return a valid JSON array with NO units like "g" or "kcal". 
        Numbers should always be raw values (e.g., 35, not "35g").
        If you detect a meal, respond with strictly formatted JSON:
        
        [
          {
            "foodName": "Descriptive name of the food",
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0
          }
        ]
        
        The "foodName" should always be a short, clear, and commonly used description of the meal (e.g., "Spaghetti Bolognese", "Chicken Salad", "Avocado Toast"). Do not use generic terms like "meal" or "food". Always use proper capitalization.
        
        No additional text, no markdown, no explanations.`
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this meal image and return ONLY a JSON object with macronutrients (calories, protein, carbs, and fat)." },
          { type: "image_url", image_url: { url: base64Image } },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 300,
  });

  let textResponse = visionResponse.choices[0]?.message?.content?.trim();
  
  console.log("🔍 Raw OpenAI Response:", textResponse); // 🔹 Debugging: Logge die Antwort
  
  try {
    // Entferne eventuelle Markdown-Formatierungen von OpenAI
    textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    parsedData = JSON.parse(textResponse);

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      console.error("🚨 AI returned an invalid format:", textResponse);
      return NextResponse.json({ error: "Invalid AI response format", rawResponse: textResponse }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ JSON Parsing Error:", error, "Raw response:", textResponse);
    return NextResponse.json({ error: "Invalid AI response format", rawResponse: textResponse }, { status: 500 });
  }

  return NextResponse.json({ meal: parsedData }, { status: 200 });
}

    // 📌 Falls **nur Text** oder **Text + Bild** analysiert werden sollen:
    const prompt = `
    Analyze the following meal and extract nutritional values.
    ALWAYS return a valid JSON array. If the meal consists of a single item, wrap it inside an array.
    The JSON format must be:
    
    [
      {
        "foodName": "Generic Meal",
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0
      }
    ]
    
    Meal description: ${inputData}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a nutrition analysis assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 250,
    });

    let textResponse = response.choices[0]?.message?.content?.trim();
    textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      console.log("🔍 Raw OpenAI Response:", textResponse); // Debugging: Logge die rohe Antwort
    
      // Falls OpenAI Markdown-Codeblöcke zurückgibt, entferne sie
      textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(textResponse);

      // Falls die Antwort ein Objekt ist, packe es in ein Array
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }
      
      if (parsedData.length === 0) {
        console.error("🚨 AI returned an empty response:", textResponse);
        return NextResponse.json({ error: "Invalid AI response format", rawResponse: textResponse }, { status: 500 });
      }
    
    } catch (error) {
      console.error("❌ JSON Parsing Error:", error, "Raw response:", textResponse);
      return NextResponse.json({ error: "Invalid AI response format", rawResponse: textResponse }, { status: 500 });
    }

    return NextResponse.json({ meal: parsedData }, { status: 200 });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}