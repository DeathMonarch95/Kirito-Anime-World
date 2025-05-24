import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AnimeList, { AnimeListSkeleton } from "./components/AnimeList"; // Ensure AnimeList and its skeleton are imported

export default function Home() {
  const [seasonalAnime, setSeasonalAnime] = useState([]);
  const [topAnime, setTopAnime] = useState([]);
  const [manga, setManga] = useState([]); // State for manga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for search and filters on Home page (if desired)
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("all"); // 'all', 'tv', 'movie', 'ova', 'special', 'ona', 'music'
  const [sort, setSort] = useState("score"); // 'score', 'popularity'
  const [genres, setGenres] = useState([]);
  const [minScore, setMinScore] = useState("");
  const [searchError, setSearchError] = useState(null); // For home page search error messages

  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce search input

  // Custom hook for debouncing
  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    return debouncedValue;
  }

  // Fetching logic for Home page content (seasonal, top, search)
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      setSearchError(null); // Clear search-specific error

      try {
        // Fetch Seasonal Anime (e.g., current season)
        const seasonalResponse = await fetch('/api/seasons/now?limit=10');
        if (!seasonalResponse.ok) throw new Error(`Failed to fetch seasonal anime: ${seasonalResponse.statusText}`);
        const seasonalData = await seasonalResponse.json();
        setSeasonalAnime(seasonalData.data || []);

        // Fetch Top Anime
        const topResponse = await fetch('/api/top/anime?limit=10');
        if (!topResponse.ok) throw new Error(`Failed to fetch top anime: ${topResponse.statusText}`);
        const topData = await topResponse.json();
        setTopAnime(topData.data || []);

        // Fetch Top Manga
        const mangaResponse = await fetch('/api/top/manga?limit=10'); // Jikan v4 top manga endpoint
        if (!mangaResponse.ok) throw new Error(`Failed to fetch top manga: ${mangaResponse.statusText}`);
        const mangaData = await mangaResponse.json();
        setManga(mangaData.data || []);

      } catch (err) {
        console.error("Error fetching home page data:", err);
        setError(err.message || "An unexpected error occurred while loading home content.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []); // Run once on component mount

  // Handle Home page search
  const searchTimeoutRef = useRef(null);
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setLoading(true);
    setSearchError(null);

    searchTimeoutRef.current = setTimeout(async () => {
      const actualQuery = searchTerm.trim();

      if (actualQuery.length > 0 && actualQuery.length < 3) {
        setSeasonalAnime([]); // Clear previous results
        setLoading(false);
        setSearchError("Please enter at least 3 characters to search on home page.");
        return;
      }

      let apiUrl;
      if (actualQuery) {
        // Corrected: Use relative path for proxy
        apiUrl = `/api/anime?q=${encodeURIComponent(actualQuery)}&type=${type}&order_by=${sort}&sort=desc&limit=12`;
        if (genres.length > 0) apiUrl += `&genres=${genres.join(',')}`;
        if (minScore) apiUrl += `&min_score=${minScore}`;
      } else {
        // Corrected: Use relative path for proxy
        apiUrl = `/api/top/anime?limit=12`; // Fallback to top anime if no search term (or load seasonal/top separate)
      }

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Too many requests. Please wait a moment before trying again.");
          } else if (response.status === 400 && actualQuery.length < 3 && actualQuery.length > 0) {
            // Specific error message for too short query
            throw new Error("Bad Request: Search query invalid or too short.");
          }
          throw new Error(`Failed to fetch anime: ${response.statusText || response.status}`);
        }
        const data = await response.json();

        let filtered = data.data || [];
        // Apply client-side filters if needed (or ensure API handles them)
        if (actualQuery && type !== "all") {
            filtered = filtered.filter((a) => a.type?.toLowerCase() === type);
        }
        // Client-side sort if API doesn't fully support all combinations with search
        if (actualQuery) {
          filtered = filtered.sort((a, b) => {
              if (sort === "score") return (b.score || 0) - (a.score || 0);
              if (sort === "popularity") return (a.popularity || 99999) - (b.popularity || 99999);
              return 0;
          });
        }
        setSeasonalAnime(filtered); // Display search results in seasonal section or create a new section
      } catch (err) {
        console.error("Home page search error:", err);
        setSearchError(err.message);
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce delay
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [debouncedSearchTerm, type, sort, genres, minScore]); // Re-run on search term or filter change

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleTypeChange = (e) => setType(e.target.value);
  const handleSortChange = (e) => setSort(e.target.value);
  const handleGenreChange = (e) => {
    const { value, checked } = e.target;
    setGenres((prev) =>
      checked ? [...prev, value] : prev.filter((genre) => genre !== value)
    );
  };
  const handleMinScoreChange = (e) => setMinScore(e.target.value);

  // Example list of all possible genres (you'd get this from your API or a static list)
  const allGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mecha', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 dark:text-white">Kirito Anime World</h1>

      {/* Search and Filters Section */}
      <div className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Quick Search & Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genres</label>
          <div className="flex flex-wrap gap-2">
            {allGenres.map((genre) => (
              <label key={genre} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200">
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

        {searchError && <p className="text-red-500 text-center mt-4">{searchError}</p>}
      </div>

      {loading ? (
        <AnimeListSkeleton />
      ) : error ? (
        <p className="text-red-500 text-center text-lg mt-8">Error: {error}</p>
      ) : (
        <>
          {searchTerm ? (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Search Results for "{searchTerm}"</h2>
              {seasonalAnime.length === 0 && <p className="text-center text-lg mt-8">No results found for "{searchTerm}" with selected filters.</p>}
              <AnimeList anime={seasonalAnime} />
            </section>
          ) : (
            <>
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Current Seasonal Anime</h2>
                {seasonalAnime.length === 0 && <p className="text-center text-lg mt-8">No seasonal anime to display.</p>}
                <AnimeList anime={seasonalAnime} />
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Top Anime</h2>
                {topAnime.length === 0 && <p className="text-center text-lg mt-8">No top anime to display.</p>}
                <AnimeList anime={topAnime} />
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Top Manga</h2>
                {manga.length === 0 && <p className="text-center text-lg mt-8">No top manga to display.</p>}
                <AnimeList anime={manga} />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}