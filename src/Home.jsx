// src/Home.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import AnimeListSkeleton from "./components/AnimeListSkeleton"; // Import the new skeleton component

export default function Home() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(""); // Initialize with empty string for top anime on load
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("score");
  const [error, setError] = useState(null);

  // Debounce setup
  const initialLoadRef = useRef(true); // To prevent fetch on initial render if query is empty
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    // Skip initial fetch if query is empty, subsequent changes will trigger
    if (initialLoadRef.current && query === "") {
      initialLoadRef.current = false;
      // You might want to fetch top anime here directly if you don't use query dependency
      // For now, it will wait for user input or other filter changes.
      return; 
    }

    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setLoading(true);
    setError(null);

    // Set a new debounce timeout
    debounceTimeoutRef.current = setTimeout(async () => {
      // Check for minimum query length (if not empty)
      const isSearchQueryTooShort = query.trim().length > 0 && query.trim().length < 3;

      if (isSearchQueryTooShort) {
        setAnimeList([]); // Clear previous results
        setLoading(false);
        setError("Please enter at least 3 characters to search.");
        return;
      }
      
      const actualQuery = query.trim();
      let apiUrl;

      // Determine API URL based on query presence
      if (actualQuery) {
        apiUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(actualQuery)}&type=${type}&order_by=${sort}&sort=desc&limit=12`;
      } else {
        // Fetch top anime if no search query is provided
        apiUrl = `https://api.jikan.moe/v4/top/anime?limit=12`; // Jikan v4 top anime endpoint
      }

      try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Too many requests. Please wait a moment before trying again.");
          }
          if (response.status === 400 && actualQuery.length < 3 && actualQuery.length > 0) {
            // This specific 400 might be caught by the `isSearchQueryTooShort` check earlier,
            // but keeping it here for robustness if Jikan's behavior changes.
            throw new Error("Bad Request: Search query invalid or too short.");
          }
          throw new Error(`Failed to fetch anime: ${response.statusText || response.status}`);
        }
        
        const data = await response.json();
        
        // Jikan v4 structure: top/anime returns data array directly, search returns data.data array
        const results = actualQuery ? (data.data || []) : data.data; 

        let processedResults = results;

        // For "top anime" endpoint, type/sort filtering might still be needed client-side
        if (!actualQuery) { // If fetching top anime
          if (type !== "all") {
            processedResults = processedResults.filter((a) => a.type?.toLowerCase() === type);
          }
          // Sorting for top anime might also be needed if the API doesn't handle 'order_by' for top results
          processedResults = processedResults.sort((a, b) => {
            if (sort === "score") return (b.score || 0) - (a.score || 0);
            if (sort === "popularity") return (a.popularity || 99999) - (b.popularity || 99999);
            return 0;
          });
        }
        // For search results, the API parameters should handle type and sort on the server side

        setAnimeList(processedResults);

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce delay of 500ms

    // Cleanup function for useEffect: clear the timeout if component unmounts or dependencies change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, type, sort]); // Dependencies for useEffect

  // Handler for search input changes
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <HeroSection />
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search anime..."
          value={query}
          onChange={handleQueryChange}
          className="p-2 border rounded w-full sm:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <div className="flex gap-4 w-full sm:w-auto">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="tv">TV</option>
            <option value="movie">Movie</option>
            <option value="ova">OVA</option>
            <option value="special">Special</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="score">Sort by Score</option>
            <option value="popularity">Sort by Popularity</option>
          </select>
        </div>
      </div>

      {loading && <AnimeListSkeleton />} {/* Display skeleton while loading */}
      {error && <p className="text-red-500 text-center">Error: {error}</p>}
      
      {!loading && !error && animeList.length === 0 && query.trim() !== "" && (
        <p className="text-center text-gray-500">No results found for "{query}".</p>
      )}
      {!loading && !error && animeList.length === 0 && query.trim() === "" && (
        <p className="text-center text-gray-500">Start searching for anime, or see top anime above!</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {!loading && !error && animeList.map((anime) => (
          <Link
            to={`/anime/${anime.mal_id}`}
            key={anime.mal_id}
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-card hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <img
              src={anime.images?.jpg?.image_url}
              alt={anime.title}
              className="w-full h-48 object-cover rounded-t-xl"
            />
            <div className="p-4">
              <h2 className="font-bold text-lg text-blue-700 dark:text-blue-300 mb-1 line-clamp-2">
                {anime.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Score: {anime.score ?? "N/A"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}