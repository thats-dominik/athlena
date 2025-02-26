"use client";
import { useState } from "react";
import AuthModal from "@/app/components/AuthModal";

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState("login"); // "login" | "signup"

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* navbar */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold tracking-wide">athlena</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setAuthStep("login");
              setIsAuthOpen(true);
            }}
            className="px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-black transition"
          >
            login
          </button>
          <button
            onClick={() => {
              setAuthStep("signup");
              setIsAuthOpen(true);
            }}
            className="px-4 py-2 bg-purple-500 rounded-lg font-semibold hover:bg-purple-600 transition"
          >
            sign up
          </button>
        </div>
      </nav>

      {/* hero section */}
      <section className="flex flex-col items-center text-center mt-16 px-6">
        <h2 className="text-4xl font-extrabold">
          <span className="text-white">wisdom in fitness</span>
        </h2>
        <h3 className="text-2xl text-blue-400 mt-2">track. transform. thrive.</h3>
        <p className="mt-4 text-gray-300 max-w-lg">
          your intelligent companion for nutrition and fitness.
        </p>

        {/* cta buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => {
              setAuthStep("signup");
              setIsAuthOpen(true);
            }}
            className="px-6 py-3 bg-purple-500 rounded-lg font-semibold hover:bg-purple-600 transition"
          >
            start now
          </button>
          <button className="px-6 py-3 border border-white rounded-lg hover:bg-white hover:text-black transition">
            learn more
          </button>
        </div>
      </section>

      {/* key features */}
      <section className="mt-16 max-w-6xl mx-auto px-6">
        <h2 className="text-center text-2xl font-bold">key features</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard number="01" title="smart tracking" description="effortlessly log calories & activities" />
          <FeatureCard number="02" title="ai analysis" description="identify meals via photo recognition" />
          <FeatureCard number="03" title="advanced stats" description="progress tracking & personalized insights" />
        </div>
      </section>

      {/* user experiences */}
      <section className="mt-16 text-center px-6">
        <h2 className="text-2xl font-bold">user experiences</h2>
        <div className="mt-6 max-w-lg mx-auto p-6 border border-gray-700 rounded-lg">
          <p className="text-gray-300">
            <span className="font-semibold">maria s.</span> <br />
            "with athlena, i finally found an app that makes nutrition tracking truly effortless..."
          </p>
          <div className="mt-4 flex justify-center gap-1">
            {Array(5).fill("⭐")}
          </div>
        </div>
      </section>

      {/* call-to-action */}
      <section className="mt-24 text-center p-10 bg-gray-800">
        <h2 className="text-xl font-bold">begin your fitness journey</h2>
      </section>

      {/* unified auth modal (login / signup / setup) */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialStep={authStep} />
    </main>
  );
}

// feature card component
function FeatureCard({ number, title, description }) {
  return (
    <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg text-center">
      <div className="text-blue-400 text-xl font-bold">{number}</div>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="mt-2 text-gray-400">{description}</p>
    </div>
  );
}