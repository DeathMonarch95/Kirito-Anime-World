// src/SearchResults.jsx
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AnimeList, { AnimeListSkeleton } from "./AnimeList"; // Ensure AnimeList and its skeleton are imported

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const queryParams = useQuery();
  const initialSearchTerm = queryParams.get("q") || "";
  const initialType = queryParams.get("type") || "all";
  const initialSort = queryParams.get("sort") || "score";

  const [anime, setAnime] = useState([]); // This will hold the search results, no 'searchResults' state needed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [type, setType] = useState(initialType);
  const [sort, setSort] = useState(initialSort);
  const [genres, setGenres] = useState([]); // State for multi-select genres
  const [minScore, setMinScore] = useState(""); // State for min score

  // Example list of all possible genres (you'd get this from your API or a static list)
  const allGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mecha', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];

  useEffect(() => {
    async function fetchSearchResults() {
      setLoading(true);
      setError(null); // Clear previous errors

      const actualQuery = searchTerm.trim();

      if (actualQuery.length > 0 && actualQuery.length < 3) {
        setAnime([]); // Clear previous results if query is too short
        setLoading(false);
        setError("Please enter at least 3 characters to search.");
        return;
      }

      // Corrected API URL to use the Netlify proxy
      let apiUrl = `/api/anime?q=${encodeURIComponent(actualQuery)}`;

      // Add filters to API URL
      if (type !== "all") {
        apiUrl += `&type=${type}`;
      }
      if (sort) { // Assuming sort is always present for ordering
        apiUrl += `&order_by=${sort}&sort=desc`; // Jikan often uses order_by and sort
      }
      if (genres.length > 0) {
        apiUrl += `&genres=${genres.join(',')}`;
      }
      if (minScore) {
        apiUrl += `&min_score=${minScore}`;
      }
      apiUrl += `&limit=20`; // Limit number of results per page

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Too many requests. Please wait a moment before trying again.");
          }
          throw new Error(`Failed to fetch anime: ${response.statusText || response.status}`);
        }
        const data = await response.json();
        setAnime(data.data || []);
      } catch (err) {
        console.error("Search results fetch error:", err);
        setError(err.message || "An unexpected error occurred during search.");
      } finally {
        setLoading(false);
      }
    }

    // Only fetch if searchTerm is valid length or if it's initial load with empty query (to show no results)
    if (searchTerm === "" || searchTerm.length >= 3) {
      fetchSearchResults();
    } else {
      setLoading(false);
      setAnime([]);
    }
  }, [searchTerm, type, sort, genres, minScore]); // Re-run effect when these dependencies change

  // Handlers for filter changes
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleTypeChange = (e) => setType(e.target.value);
  const handleSortChange = (e) => setSort(e.target.value);
  const handleMinScoreChange = (e) => setMinScore(e.target.value);
  const handleGenreChange = (e) => {
    const { value, checked } = e.target;
    setGenres((prev) =>
      checked ? [...prev, value] : prev.filter((genre) => genre !== value)
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setType("all");
    setSort("score");
    setGenres([]);
    setMinScore("");
    // useEffect will re-run due to dependency changes and trigger a new fetch
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 dark:text-white">Anime Search Results</h1>

      <form className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Anime</label>
            <input
              type="text"
              id="search"
              placeholder="Search anime..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="mt-1 block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
            <select
              id="type"
              value={type}
              onChange={handleTypeChange}
              className="mt-1 block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 dark:text-white"
            >
              <option value="all">All</option>
              <option value="tv">TV</option>
              <option value="movie">Movie</option>
              <option value="ova">OVA</option>
              <option value="special">Special</option>
              <option value="ona">ONA</option>
              <option value="music">Music</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
            <select
              id="sort"
              value={sort}
              onChange={handleSortChange}
              className="mt-1 block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 dark:text-white"
            >
              <option value="score">Score</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

          {/* Min Score Filter */}
          <div>
            <label htmlFor="minScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Score</label>
            <input
              type="number"
              id="minScore"
              placeholder="e.g., 7.5"
              value={minScore}
              onChange={handleMinScoreChange}
              min="1"
              max="10"
              step="0.1"
              className="mt-1 block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Genre Filter */}
        <div className="mt-6 w-full max-w-4xl">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genres</label>
          <div className="flex flex-wrap gap-2">
            {allGenres.map((genre) => (
              <label key={genre} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 transition duration-200">
                <input
                  type="checkbox"
                  value={genre}
                  checked={genres.includes(genre)}
                  onChange={handleGenreChange}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2 focus:ring-blue-500"
                />
                {genre}
              </label>
            ))}
          </div>
        </div>

        <button
          type="button" // Change to button type to prevent form submission unless needed
          onClick={handleClearFilters}
          className="mt-6 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-700 transition duration-300 transform active:scale-95 self-end"
        >
          Clear Filters
        </button>
      </form>

      {loading ? <AnimeListSkeleton /> : <AnimeList anime={anime} />}
      {error && <p className="text-red-500 text-center text-lg mt-8">{error}</p>}
    </div>
  );
}      