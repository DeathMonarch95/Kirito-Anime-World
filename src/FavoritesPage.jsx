import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnimeCard from "./components/AnimeCard"; // Assuming you have an AnimeCard for consistent display

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(saved);
  }, []);

  const handleRemoveFavorite = (mal_id) => {
    const updatedFavorites = favorites.filter(anime => anime.mal_id !== mal_id);
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  if (favorites.length === 0) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Favorites</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">No favorite anime yet. Add some to your list!</p>
        <Link to="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800 transition duration-300 transform active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Favorite Anime</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {favorites.map((anime) => (
          <div key={anime.mal_id} className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-card hover:shadow-xl transition duration-300 group">
            <Link to={`/anime/${anime.mal_id}`} className="block">
              <img
                src={anime.images?.jpg?.image_url || anime.images?.jpg?.small_image_url} // Use image_url first, then small
                alt={anime.title}
                className="w-full h-56 object-cover transition duration-300 group-hover:opacity-90"
              />
              <div className="p-4">
                <h2 className="font-bold text-lg text-primary-blue-700 dark:text-primary-blue-300 mb-1 group-hover:underline">
                  {anime.title}
                </h2>
              </div>
            </Link>
            <button
              onClick={() => handleRemoveFavorite(anime.mal_id)}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full text-sm font-semibold opacity-80 hover:opacity-100 transition duration-300 transform hover:scale-105"
              title="Remove from Favorites"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}