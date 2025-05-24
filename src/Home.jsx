import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AnimeList from "./components/AnimeList";
import AnimeListSkeleton from "./components/AnimeListSkeleton"; // Correct import for AnimeListSkeleton

export default function Home() {
  const [seasonalAnime, setSeasonalAnime] = useState([]);
  const [topAnime, setTopAnime] = useState([]);
  const [manga, setManga] = useState([]); // State for manga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for search and filters on Home page
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("all"); // 'all', 'tv', 'movie', 'ova', 'special', 'ona', 'music'
  const [sort, setSort] = useState("score"); // 'score', 'popularity'
  const [genres, setGenres] = useState([]);
  const [minScore, setMinScore] = useState("");
  const [searchError, setSearchError] = useState(null); // For home page search error messages
  const [genreMap, setGenreMap] = useState({}); // New state to store genre name to ID mapping

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

  // Fetch genre mapping from Jikan API on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/genres/anime'); // Adjust path if needed
        if (!response.ok) {
          throw new Error(`Failed to fetch genres: ${response.status}`);
        }
        const data = await response.json();
        // Assuming data.data is an array of genre objects like {mal_id: 1, name: "Action"}
        const map = data.data.reduce((acc, genre) => {
          acc[genre.name] = genre.mal_id;
          return acc;
        }, {});
        setGenreMap(map);
      } catch (err) {
        console.error("Error fetching genres:", err);
        // Optionally set an error state or display a message
      }
    };

    fetchGenres();
  }, []); // Run once on component mount

  // Fetching logic for Home page content (seasonal, top)
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

      let urlParams = [];

      if (actualQuery) {
          urlParams.push(`q=${encodeURIComponent(actualQuery)}`);
      }

      // ONLY add type if it's NOT "all"
      if (type && type !== "all") {
          urlParams.push(`type=${type}`);
      }
      if (sort) {
          urlParams.push(`order_by=${sort}`, `sort=desc`);
      }
      const selectedGenreIds = genres.map(name => genreMap[name]).filter(id => id !== undefined);
      if (selectedGenreIds.length > 0) {
          urlParams.push(`genres=${selectedGenreIds.join(',')}`);
      }
      if (minScore) {
          urlParams.push(`min_score=${minScore}`);
      }
      urlParams.push(`limit=20`); // Always include limit=20 for home page search

      const apiUrl = `/api/anime?${urlParams.join('&')}`;

      // Only make the API call if there's a search term or any filter is applied
      if (!actualQuery && type === "all" && sort === "score" && genres.length === 0 && !minScore) {
          setSeasonalAnime([]); // Clear if no search and default filters
          setLoading(false);
          return; // Exit early if no search term and no filters
      }

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Too many requests. Please wait a moment before trying again.");
          } else if (response.status === 400) {
            // Specific error message for too short query or invalid parameters
            throw new Error(`Failed to fetch anime: ${response.statusText || response.status} (Check your search term or filters)`);
          }
          throw new Error(`Failed to fetch anime: ${response.statusText || response.status}`);
        }
        const data = await response.json();
        setSeasonalAnime(data.data || []); // Display search results in seasonal section
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
  }, [debouncedSearchTerm, type, sort, genres, minScore, genreMap]); // Re-run effect when these dependencies change


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleTypeChange = (e) => {
    setType(e.target.value);
  };
  const handleSortChange = (e) => {
    setSort(e.target.value);
  };
  const handleGenreChange = (e) => {
    const { value, checked } = e.target;
    setGenres((prevGenres) =>
      checked ? [...prevGenres, value] : prevGenres.filter((genre) => genre !== value)
    );
  };
  const handleMinScoreChange = (e) => {
    setMinScore(e.target.value);
  };
  const handleClearFilters = () => {
    setSearchTerm("");
    setType("all");
    setSort("score");
    setGenres([]);
    setMinScore("");
  };


  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <h1 className="text-4xl font-extrabold text-center text-indigo-600 dark:text-indigo-400 mb-8">
        Kirito Anime World
      </h1>

      {/* Home Page Search and Filter Form */}
      <form onSubmit={(e) => e.preventDefault()} className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search anime on home page..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition duration-200"
        />

        {/* Type Filter */}
        <select
          value={type}
          onChange={handleTypeChange}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition duration-200"
        >
          <option value="all">All Types</option>
          <option value="tv">TV</option>
          <option value="movie">Movie</option>
          <option value="ova">OVA</option>
          <option value="special">Special</option>
          <option value="ona">ONA</option>
          <option value="music">Music</option>
        </select>

        {/* Sort Order */}
        <select
          value={sort}
          onChange={handleSortChange}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition duration-200"
        >
          <option value="score">Score</option>
          <option value="popularity">Popularity</option>
        </select>

        {/* Minimum Score */}
        <input
          type="number"
          placeholder="Min Score (1-10)"
          value={minScore}
          onChange={handleMinScoreChange}
          min="1"
          max="10"
          step="0.1"
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition duration-200 w-36"
        />

        {/* Genre Filter - Example, you'd populate this dynamically */}
        <div className="w-full sm:w-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition duration-200">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genres:</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {/* Populate with actual genres from your API or a static list */}
                {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mecha', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'].map((genre) => (
                    <label key={genre} className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 transition duration-200">
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
          type="button"
          onClick={handleClearFilters}
          className="mt-6 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-700 transition duration-300 transform active:scale-95 self-end"
        >
          Clear Filters
        </button>
      </form>

      {searchError && (
        <p className="text-red-500 text-center text-lg mt-4">{searchError}</p>
      )}

      {loading && !searchTerm ? (
        <AnimeListSkeleton />
      ) : (
        <>
          {searchTerm ? (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Search Results for "{searchTerm}"</h2>
              {seasonalAnime.length === 0 && !searchError && <p className="text-center text-lg mt-8">No results found for "{searchTerm}" with selected filters.</p>}
              <AnimeList anime={seasonalAnime} loading={loading} />
            </section>
          ) : (
            <>
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Current Seasonal Anime</h2>
                {seasonalAnime.length === 0 && <p className="text-center text-lg mt-8">No seasonal anime to display.</p>}
                <AnimeList anime={seasonalAnime} loading={loading} />
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Top Anime</h2>
                {topAnime.length === 0 && <p className="text-center text-lg mt-8">No top anime to display.</p>}
                <AnimeList anime={topAnime} loading={loading} />
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Top Manga</h2>
                {manga.length === 0 && <p className="text-center text-lg mt-8">No top manga to display.</p>}<AnimeList anime={manga} loading={loading} />
              </section>
            </>
          )}
        </>
      )}

      {error && <p className="text-red-500 text-center text-lg mt-8">Error: {error}</p>}
    </div>
  );
}      