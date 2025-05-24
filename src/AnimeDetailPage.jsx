// src/AnimeDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AnimeCharacters from "./components/AnimeCharacters";
import AnimeRecommendations from "./components/AnimeRecommendations";
import CommentsSection from "./components/CommentsSection"; // Assuming you have this

// New Skeleton Component for Detail Page
const AnimeDetailSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6 animate-pulse">
    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-6"></div> {/* Back button placeholder */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-6"></div> {/* Title placeholder */}
      <div className="w-full h-96 bg-gray-300 dark:bg-gray-700 rounded-lg mb-6"></div> {/* Image placeholder */}
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-full mb-6"></div> {/* Trailer placeholder */}
      <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded w-full mb-6"></div> {/* Synopsis placeholder */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[...Array(4)].map((_, i) => ( // Placeholders for details
          <div key={i} className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        ))}
      </div>
      <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-full"></div> {/* Favorite button placeholder */}
    </div>
    <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-8"></div> {/* Characters section placeholder */}
    <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-8"></div> {/* Recommendations section placeholder */}
    <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl shadow-lg p-6"></div> {/* Comments section placeholder */}
  </div>
);


export default function AnimeDetailPage() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // States for "Show More/Less" functionality
  const [showAllCharacters, setShowAllCharacters] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  const initialCharactersLimit = 8; // Number of characters to show initially
  const initialRecommendationsLimit = 5; // Number of recommendations to show initially


  useEffect(() => {
    async function fetchAnimeDetails() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/anime/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnime(data.data); // Assuming data.data holds the anime object

        // Fetch characters
        const charactersResponse = await fetch(`/api/anime/${id}/characters`);
        if (!charactersResponse.ok) {
          throw new Error(`HTTP error! status: ${charactersResponse.status}`);
        }
        const charactersData = await charactersResponse.json();
        setCharacters(charactersData.data || []); // Assuming data.data is an array of characters

        // Fetch recommendations
        const recommendationsResponse = await fetch(`/api/anime/${id}/recommendations`);
        if (!recommendationsResponse.ok) {
          throw new Error(`HTTP error! status: ${recommendationsResponse.status}`);
        }
        const recommendationsData = await recommendationsResponse.json();
        setRecommendations(recommendationsData.data || []); // Assuming data.data is an array of recommendations

        // Check if anime is in favorites (dummy implementation)
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        setIsFavorite(favorites.some(fav => fav.mal_id === data.data.mal_id));

      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch anime details:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchAnimeDetails();
    }
  }, [id]);

  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let updatedFavorites;
    if (isFavorite) {
      updatedFavorites = favorites.filter(fav => fav.mal_id !== anime.mal_id);
    } else {
      updatedFavorites = [...favorites, anime];
    }
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return <AnimeDetailSkeleton />;
  }

  if (error) {
    return <p className="text-red-500 text-center text-lg mt-8 dark:text-red-400">Error: {error}</p>;
  }

  if (!anime) {
    return <p className="text-center text-lg mt-8 dark:text-gray-300">Anime not found.</p>;
  }

  const displayedCharacters = showAllCharacters ? characters : characters.slice(0, initialCharactersLimit);
  const displayedRecommendations = showAllRecommendations ? recommendations : recommendations.slice(0, initialRecommendationsLimit);

  return (
    <div className="max-w-4xl mx-auto p-6 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <Link
        to="/"
        className="text-blue-500 hover:underline mb-6 inline-block text-lg"
      >
        &larr; Back to Home
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="flex-shrink-0">
          <img
            src={anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url}
            alt={anime.title}
            className="rounded-lg shadow-md w-64 h-auto object-cover"
          />
        </div>
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {anime.title}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            **Score:** {anime.score || 'N/A'} (Rank: {anime.rank || 'N/A'})
          </p>
          <p className="text-md text-gray-600 dark:text-gray-400 mb-4">
            **Episodes:** {anime.episodes || 'N/A'} | **Status:** {anime.status || 'N/A'} | **Aired:** {anime.aired?.string || 'N/A'}
          </p>
          {anime.trailer?.embed_url && (
            <div className="mb-4 aspect-video w-full max-w-lg mx-auto md:mx-0">
              <iframe
                src={anime.trailer.embed_url}
                title={`${anime.title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              ></iframe>
            </div>
          )}
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
            {anime.synopsis || 'No synopsis available.'}
          </p>
          <div className="mb-4">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Genres:</span>{" "}
            {anime.genres && anime.genres.length > 0 ? (
              anime.genres.map((g) => (
                <span
                  key={g.mal_id}
                  className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mb-2 dark:bg-blue-900 dark:text-blue-100"
                >
                  {g.name}
                </span>
              ))
            ) : (
              <span className="text-gray-500 dark:text-gray-400">N/A</span>
            )}
          </div>

          <button
            onClick={handleToggleFavorite}
            className={`w-full py-3 rounded-lg font-semibold text-lg transition duration-300 ease-in-out ${
              isFavorite
                ? "bg-red-500 text-white hover:bg-red-600 shadow-md transform active:scale-98"
                : "bg-green-500 text-white hover:bg-green-600 shadow-md transform active:scale-98"
            }`}
          >
            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </button>
        </div>
      </div>

      {/* Characters Section */}
      {characters.length > 0 && (
        <section className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Characters</h2>
          <AnimeCharacters characters={displayedCharacters} />
          {characters.length > initialCharactersLimit && (
            <button
              onClick={() => setShowAllCharacters(!showAllCharacters)}
              className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-200"
            >
              {showAllCharacters ? "Show Less Characters" : "Show All Characters"}
            </button>
          )}
        </section>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <section className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Similar Anime (Recommendations)</h2>
          <AnimeRecommendations recommendations={displayedRecommendations} />
          {recommendations.length > initialRecommendationsLimit && (
            <button
              onClick={() => setShowAllRecommendations(!showAllRecommendations)}
              className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-200"
            >
              {showAllRecommendations ? "Show Less Recommendations" : "Show All Recommendations"}
            </button>
          )}
        </section>
      )}

      {/* Comments Section (if you have one) */}
      {/*
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Comments</h2>
        <CommentsSection animeId={id} />
      </section>
      */}
    </div>
  );
}        