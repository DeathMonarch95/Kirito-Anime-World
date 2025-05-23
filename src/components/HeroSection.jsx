// src/components/HeroSection.jsx
import React from "react";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-blue-600 via-primary-blue-700 to-primary-blue-800 text-white rounded-4xl shadow-card mb-10 overflow-hidden">
      <div className="px-6 py-20 max-w-4xl mx-auto text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight mb-4">
          Welcome to <span className="text-accent-yellow-300">Kirito Anime World</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-100">
          Discover the best anime, explore ratings, characters, trailers and reviews. Your anime journey starts here.
        </p>
      </div>
      {/* Background image overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://cdn.myanimelist.net/images/anime/4/19644.jpg')] bg-cover bg-center" />
    </section>
  );
}