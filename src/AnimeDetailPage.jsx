// src/AnimeDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AnimeCharacters from "./components/AnimeCharacters";
import AnimeRecommendations from "./components/AnimeRecommendations";
import CommentsSection from "./components/CommentsSection";

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
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        ))}
      </div>
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full mb-6"></div> {/* Genres placeholder */}
      <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-full"></div> {/* Favorite button placeholder */}
    </div>

    {/* Characters section skeleton */}
    <section className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded p-2">
            <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-1"></div> {/* Fixed size for character skeleton */}
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto mt-1"></div>
          </div>
        ))}
      </div>
    </section>

    {/* Recommendations section skeleton */}
    <section>
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded p-2">
            <div className="w-full h-40 bg-gray-300 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </section>
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

  // User review state (moved from previous internal section)
  const [userComment, setUserComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [savedReview, setSavedReview] = useState(null); // This might be handled by CommentsSection now

  useEffect(() => {
    // Check if anime is in favorites on load
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((fav) => fav.mal_id === parseInt(id)));

    async function fetchDetails() {
      setLoading(true);
      setError(null);

      // --- Caching Logic Start ---
      const cachedData = localStorage.getItem(`anime_${id}`);
      if (cachedData) {
        const { animeData, charData, recData, timestamp } = JSON.parse(cachedData);
        const cacheExpiry = 1000 * 60 * 60; // Cache for 1 hour (adjust as needed)
        if (Date.now() - timestamp < cacheExpiry) {
          setAnime(animeData);
          setCharacters(charData || []);
          setRecommendations(recData || []);
          setLoading(false);
          console.log("Data loaded from cache for anime ID:", id);
          return; // Exit if data is fresh from cache
        } else {
          console.log("Cache expired for anime ID:", id);
          localStorage.removeItem(`anime_${id}`); // Clear expired cache
        }
      }
      // --- Caching Logic End ---

      try {
        const [animeRes, charRes, recRes] = await Promise.all([
          fetch(`https://api.jikan.moe/v4/anime/${id}`),
          fetch(`https://api.jikan.moe/v4/anime/${id}/characters`),
          fetch(`https://api.jikan.moe/v4/anime/${id}/recommendations`)
        ]);

        if (!animeRes.ok) throw new Error(`Failed to load anime details: ${animeRes.status} ${animeRes.statusText}`);
        if (!charRes.ok) throw new Error(`Failed to load characters: ${charRes.status} ${charRes.statusText}`);
        if (!recRes.ok) {
          const errorText = await recRes.text(); // Try to read response body for more info
          throw new Error(`Failed to load recommendations: ${recRes.status} ${recRes.statusText}. Response: ${errorText}`);
        }

        const animeData = await animeRes.json();
        const charData = await charRes.json();
        const recData = await recRes.json();

        setAnime(animeData.data);
        setCharacters(charData.data || []);
        setRecommendations(recData.data || []);

        // --- Store in Cache on Success ---
        localStorage.setItem(`anime_${id}`, JSON.stringify({
          animeData: animeData.data,
          charData: charData.data,
          recData: recData.data,
          timestamp: Date.now()
        }));
        // --- End Store in Cache ---

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]); // Re-fetch when ID changes

  const handleToggleFavorite = () => {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (isFavorite) {
      favorites = favorites.filter((fav) => fav.mal_id !== anime.mal_id);
    } else {
      favorites.push({
        mal_id: anime.mal_id,
        title: anime.title,
        images: anime.images, // Save images for card display
        score: anime.score
      });
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  // This handleSaveReview is likely replaced by CommentsSection now, keeping for context if needed
  const handleSaveReview = () => {
    if (userComment.trim() || userRating > 0) {
      setSavedReview({ comment: userComment, rating: userRating });
      setUserComment("");
      setUserRating(0);
      alert("Review saved!");
    }
  };

  if (loading) return <AnimeDetailSkeleton />;
  if (error) return <p className="text-red-500 text-center mt-10">Error: {error}</p>;
  if (!anime) return <p className="text-center mt-10">Anime not found</p>;

  // Function to handle studio/producer click
  const handleCompanyClick = (companyName) => {
    alert(`Navigating to page for ${companyName}`);
    console.log(`Company clicked: ${companyName}`);
    // Here you would typically navigate to a /company/:id page
  };


  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/" className="text-blue-600 hover:underline mb-4 block">
        ← Back to Home
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center text-primary-blue-700 dark:text-primary-blue-300">
          {anime.title}
        </h1>
        <img
          src={anime.images?.jpg.large_image_url}
          alt={anime.title}
          className="rounded w-full max-h-[500px] object-cover mb-6"
        />

        {/* Trailer */}
        {anime.trailer?.embed_url && (
          <div className="mb-6 aspect-w-16 aspect-h-9">
            <iframe
              src={anime.trailer.embed_url}
              title="Trailer"
              allowFullScreen
              className="w-full h-full rounded"
            />
          </div>
        )}

        <p className="mb-4 text-gray-700 dark:text-gray-300">{anime.synopsis}</p>

        <div className="mb-4 grid grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          <div>
            <strong>Type:</strong> {anime.type}
          </div>
          <div>
            <strong>Status:</strong> {anime.status}
          </div>
          <div>
            <strong>Episodes:</strong> {anime.episodes ?? "?"}
          </div>
          <div>
            <strong>Score:</strong> {anime.score ?? "N/A"}
          </div>
          <div>
            <strong>Rating:</strong> {anime.rating}
          </div>
          <div>
            <strong>Aired:</strong> {anime.aired?.string ?? "N/A"}
          </div>
          {/* Studios */}
          {anime.studios && anime.studios.length > 0 && (
            <div>
              <strong>Studios:</strong>{" "}
              {anime.studios.map((s) => (
                <span
                  key={s.mal_id}
                  onClick={() => handleCompanyClick(s.name)}
                  className="cursor-pointer text-blue-600 hover:underline"
                >
                  {s.name}
                </span>
              )).reduce((prev, curr) => [prev, ", ", curr])}
            </div>
          )}
          {/* Producers */}
          {anime.producers && anime.producers.length > 0 && (
            <div>
              <strong>Producers:</strong>{" "}
              {anime.producers.map((p) => (
                <span
                  key={p.mal_id}
                  onClick={() => handleCompanyClick(p.name)}
                  className="cursor-pointer text-blue-600 hover:underline"
                >
                  {p.name}
                </span>
              )).reduce((prev, curr) => [prev, ", ", curr])}
            </div>
          )}
        </div>

        {/* Genres */}
        <div className="mb-6">
          <strong>Genres:</strong>{" "}
          {anime.genres.map((g) => (
            <span
              key={g.mal_id}
              className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mb-2 dark:bg-blue-900 dark:text-blue-100"
            >
              {g.name}
            </span>
          ))}
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

      {/* Characters Section */}
      <section className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <AnimeCharacters characters={characters} />
      </section>

      {/* Recommendations Section */}
      <section className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <AnimeRecommendations recommendations={recommendations} />
      </section>

      {/* Comments & Ratings Section (using dedicated component) */}
      <section className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <CommentsSection animeId={id} />
      </section>
    </div>
  );
}