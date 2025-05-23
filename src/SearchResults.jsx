// src/SearchResults.jsx - Example of how you might expand filtering
// (This is conceptual and requires your backend API to support these filters)

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AnimeList, { AnimeListSkeleton } from "./components/AnimeList"; // Import skeleton as well

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const queryParams = useQuery();
  const initialSearchTerm = queryParams.get("q") || "";
  const initialType = queryParams.get("type") || "all";
  const initialSort = queryParams.get("sort") || "score";

  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [type, setType] = useState(initialType);
  const [sort, setSort] = useState(initialSort);
  const [genres, setGenres] = useState([]); // New state for multi-select genres
  const [minScore, setMinScore] = useState(""); // New state for min score

  // Example list of all possible genres (you'd get this from your API or a static list)
  const allGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mecha', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];

  useEffect(() => {
    async function fetchSearch() {
      if (!searchTerm) {
        setLoading(false);
        setAnime([]); // Clear results if no search term
        return;
      }
      setLoading(true);
      setError(null);

      // Construct API URL with all filters
      let apiUrl = `/api/anime/search?query=${encodeURIComponent(searchTerm)}`;
      if (type !== "all") apiUrl += `&type=${type}`;
      if (sort !== "score") apiUrl += `&sort=${sort}`; // Your API might need to handle this
      if (genres.length > 0) apiUrl += `&genres=${genres.join(',')}`; // Pass selected genres
      if (minScore) apiUrl += `&min_score=${minScore}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch search results");
        const data = await response.json();

        // Client-side filtering/sorting if API doesn't support all combinations
        let filtered = data.results || [];
        if (type !== "all") {
            filtered = filtered.filter((a) => a.type?.toLowerCase() === type);
        }
        if (genres.length > 0) {
            filtered = filtered.filter(a =>
                a.genres && a.genres.some(g => genres.includes(g.name))
            );
        }
        if (minScore) {
            filtered = filtered.filter(a => (a.score || 0) >= parseFloat(minScore));
        }

        filtered = filtered.sort((a, b) => {
          if (sort === "score") return (b.score || 0) - (a.score || 0);
          if (sort === "popularity") return (a.popularity || 99999) - (b.popularity || 99999);
          // Add more sorting logic here
          return 0;
        });

        setAnime(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSearch();
  }, [searchTerm, type, sort, genres, minScore]); // Re-fetch when any filter changes

  const handleGenreChange = (e) => {
      const { value, checked } = e.target;
      if (checked) {
          setGenres(prev => [...prev, value]);
      } else {
          setGenres(prev => prev.filter(genre => genre !== value));
      }
  };

  const handleClearFilters = () => {
      setSearchTerm(initialSearchTerm); // Or just "" to clear completely
      setType("all");
      setSort("score");
      setGenres([]);
      setMinScore("");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Search Results for "{initialSearchTerm}"</h1>

      <form className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-grow">
                <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Term</label>
                <input
                    id="search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Refine search..."
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-300"
                />
            </div>
            <div>
                <label htmlFor="type-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                    id="type-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-300"
                >
                    <option value="all">All Types</option>
                    <option value="tv">TV</option>
                    <option value="movie">Movie</option>
                    <option value="ova">OVA</option>
                    <option value="special">Special</option>
                </select>
            </div>
            <div>
                <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                <select
                    id="sort-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-300"
                >
                    <option value="score">Score</option>
                    <option value="popularity">Popularity</option>
                    {/* Add more sort options if supported by API/client-side */}
                </select>
            </div>
            <div>
                <label htmlFor="min-score-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Score</label>
                <input
                    id="min-score-input"
                    type="number"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    placeholder="e.g., 7.0"
                    min="1" max="10" step="0.1"
                    className="w-28 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-300"
                />
            </div>
        </div>

        {/* Genre Multi-select */}
        <div className="mt-4">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genres:</span>
            <div className="flex flex-wrap gap-2">
                {allGenres.map(genre => (
                    <label key={genre} className="inline-flex items-center cursor-pointer px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 transition duration-200">
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
      {error && <p className="text-red-500 text-center text-lg mt-8">Error: {error}</p>}
      {!loading && anime.length === 0 && <p className="text-center text-lg mt-8">No results found for "{searchTerm}" with selected filters.</p>}
    </div>
  );
}