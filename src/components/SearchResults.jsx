// src/SearchResults.jsx - Example of how you might expand filtering
// (This is conceptual and requires your backend API to support these filters)

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AnimeList, { AnimeListSkeleton } from "./components/AnimeList"; // Import skeleton as well
// Assuming SearchFilter component is not directly used here, but its logic is inline.
// If you have a separate SearchFilter.jsx, ensure it's imported correctly.

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
      // If no search term is present initially, we might not want to fetch anything
      // or fetch a default list (e.g., top anime). For now, it clears results.
      if (!searchTerm) {
        setLoading(false);
        setAnime([]); // Clear results if no search term
        return;
      }
      setLoading(true);
      setError(null);

      // Construct API URL with all filters
      // --- START OF CORRECTIONS ---
      // Jikan API (v4) uses '/anime?q=' for search queries.
      let apiUrl = `/api/anime?q=${encodeURIComponent(searchTerm)}`;

      // Add type filter
      if (type !== "all") {
        apiUrl += `&type=${type}`;
      }

      // Add sort filter (Jikan API uses 'order_by' and 'sort' parameters)
      // 'score' and 'popularity' are common 'order_by' values.
      // 'desc' is typically used for higher scores/popularity first.
      if (sort === "score") {
          apiUrl += `&order_by=score&sort=desc`;
      } else if (sort === "popularity") {
          apiUrl += `&order_by=popularity&sort=desc`;
      }
      // Add more sort options here if supported by Jikan API and your UI.

      // Genre filtering: Jikan API expects genre *IDs*, not names.
      // Your current `genres` state holds names.
      // To filter by genre via API, you'd need a mapping from name to ID.
      // For now, API-side genre filtering is commented out to prevent "Bad Request" if IDs are not used.
      // Client-side genre filtering will still apply below.
      /*
      if (genres.length > 0) {
        // Example if you had a genreNameToIdMap:
        // const genreIds = genres.map(name => genreNameToIdMap[name]).filter(Boolean);
        // if (genreIds.length > 0) {
        //   apiUrl += `&genres=${genreIds.join(',')}`;
        // }
      }
      */

      // Add minimum score filter
      if (minScore) {
        apiUrl += `&min_score=${minScore}`;
      }

      // Add a limit to the number of results to prevent overwhelming the API
      apiUrl += `&limit=25`; // You can adjust this limit as needed

      console.log("Fetching search results from URL:", apiUrl); // Log the constructed URL for debugging
      // --- END OF CORRECTIONS ---

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            // Attempt to parse error response for more details
            const errorData = await response.json().catch(() => ({ message: response.statusText || 'Unknown error' }));
            throw new Error(`Failed to fetch search results. Status: ${response.status}. Message: ${errorData.message || 'No specific message from API.'}`);
        }
        const data = await response.json();

        // --- START OF CORRECTIONS ---
        // Jikan API (v4) returns the main array of results within the 'data' property.
        let filtered = data.data || []; // CORRECTED: Access data.data
        // --- END OF CORRECTIONS ---

        // Client-side filtering/sorting (as a fallback or for further refinement)
        // These filters apply AFTER data is fetched from the API.
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

        // Client-side sorting (if API sorting is not sufficient or for additional criteria)
        filtered = filtered.sort((a, b) => {
          if (sort === "score") return (b.score || 0) - (a.score || 0);
          if (sort === "popularity") return (a.popularity || 99999) - (b.popularity || 99999);
          // Add more client-side sorting logic here if needed
          return 0;
        });

        setAnime(filtered);
      } catch (err) {
        console.error("Fetch error in SearchResults:", err); // Log the full error to console
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSearch();
  }, [searchTerm, type, sort, genres, minScore]); // Re-fetch when any filter changes

  // Handlers for filter changes
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
      if (checked) {
          setGenres(prev => [...prev, value]);
      } else {
          setGenres(prev => prev.filter(genre => genre !== value));
      }
  };

  const handleMinScoreChange = (e) => {
    setMinScore(e.target.value);
  };

  const handleClearFilters = () => {
      setSearchTerm(""); // Clear search term completely
      setType("all");
      setSort("score");
      setGenres([]);
      setMinScore("");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Search Results for "{searchTerm}"</h1>

      <form className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-grow">
                <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Term</label>
                <input
                    id="search-input"
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Refine search..."
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-300"
                />
            </div>
            <div>
                <label htmlFor="type-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                    id="type-select"
                    value={type}
                    onChange={handleTypeChange}
                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-300"
                >
                    <option value="all">All Types</option>
                    <option value="tv">TV</option>
                    <option value="movie">Movie</option>
                    <option value="ova">OVA</option>
                    <option value="special">Special</option>
                    <option value="ona">ONA</option>
                    <option value="music">Music</option>
                </select>
            </div>
            <div>
                <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                <select
                    id="sort-select"
                    value={sort}
                    onChange={handleSortChange}
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
                    onChange={handleMinScoreChange}
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
