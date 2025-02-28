"use client";
import { useState } from "react";
import Link from "next/link";
import AuthModal from "@/app/components/AuthModal";
import Goddess3D from "@/app/components/Goddess3D";

export default function LearnMore() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white p-6">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto text-center mt-10">
        <h1 className="text-4xl font-extrabold">discover athlena</h1>
        <p className="mt-2 text-lg text-gray-300 max-w-2xl mx-auto">
          your ultimate companion for fitness & nutrition tracking.
        </p>
      </header>

      {/* Sections */}
      <section className="mt-12 max-w-6xl mx-auto">
        
        {/* 1️⃣ & 2️⃣ Mit 3D-Modell rechts */}
        <div className="flex flex-col md:flex-row items-start">
          
          {/* Linke Seite: Text (3/4 der Breite) */}
          <div className="w-full md:w-3/4 pr-8">
            
            {/* 1️⃣ Was ist Athlena? */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-blue-400">what is athlena?</h2>
              <p className="mt-2 text-gray-300">
                athlena is an intelligent tracking app that helps you monitor your daily calorie intake, analyze meals 
                using AI, and track your progress effortlessly. whether you're a fitness enthusiast, athlete, or just 
                looking to stay healthy, athlena provides the tools you need to succeed.
              </p>
            </div>

            {/* 2️⃣ Wie funktioniert die App? */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-blue-400">how does it work?</h2>
              <ul className="mt-2 space-y-4 text-gray-300 list-disc list-inside">
                <li>
                  <b>calorie tracking</b> – log your meals with precise calorie calculations tailored to your fitness goals.
                </li>
                <li>
                  <b>ai meal analysis</b> – upload a picture of your food, and our ai will estimate its nutritional values.
                </li>
                <li>
                <b>exercise & activity logging</b> – track workouts and calories burned to optimize your routine.
                </li>
                <li>
                <b>personalized goals</b> – set your weight, muscle gain, or fat loss targets and get detailed insights.
                </li>
              </ul>

            </div>
          </div>

          {/* Rechte Seite: 3D-Modell (1/4 der Breite) */}
          <div className="hidden md:flex w-1/4 justify-center">
            <Goddess3D />
          </div>
          
        </div>

        {/* 3️⃣ & 4️⃣ VOLLE BREITE */}
        
        {/* Features Übersicht */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-blue-400">core features</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              number="01"
              title="smart tracking"
              description="effortlessly log calories & activities"
            />
            <FeatureCard
              number="02"
              title="ai analysis"
              description="identify meals via photo recognition"
            />
            <FeatureCard
              number="03"
              title="advanced stats"
              description="progress tracking & personalized insights"
            />
          </div>
        </div>

        {/* Warum Athlena? */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-blue-400">why choose athlena?</h2>
          <p className="mt-2 text-gray-300">
            unlike other fitness apps, athlena combines ai-driven meal recognition, advanced analytics, and an
            intuitive design to make your fitness journey seamless and efficient.
          </p>
        </div>

      </section>

      {/* CTA (Call to Action) */}
      <section className="mt-12 text-center">
        <h2 className="text-2xl font-bold">ready to transform your fitness?</h2>
        <div className="mt-4 flex justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 border border-white rounded-lg hover:bg-white hover:text-black transition"
          >
            back to home
          </Link>
          <button 
            onClick={() => setIsAuthOpen(true)}
            className="px-6 py-3 bg-purple-500 rounded-lg font-semibold hover:bg-purple-600 transition"
          >
            get started
          </button>
        </div>
      </section>

      {/* AuthModal für Registrierung */}
      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />}
    
    </div>
  );
}

// Feature Card Component (Wiederverwendbar)
function FeatureCard({ number, title, description }) {
  return (
    <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg text-center">
      <div className="text-blue-400 text-xl font-bold">{number}</div>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="mt-2 text-gray-400">{description}</p>
    </div>
  );
}