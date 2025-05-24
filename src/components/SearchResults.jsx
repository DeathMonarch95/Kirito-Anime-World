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
  const [genreMap, setGenreMap] = useState({}); // New state to store genre name to ID mapping

  // Custom hook for debouncing (as provided in your Home.jsx)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      setError(null);
      try {
        const selectedGenreIds = genres.map(name => genreMap[name]).filter(id => id !== undefined);

        // Build API URL conditionally
        let urlParams = [];

        let actualQuery = debouncedSearchTerm ? encodeURIComponent(debouncedSearchTerm) : '';
        if (actualQuery) {
            urlParams.push(`q=${actualQuery}`);
        }

        if (type !== "all") {
            urlParams.push(`type=${type}`);
        }
        if (sort) {
            urlParams.push(`order_by=${sort}`, `sort=desc`);
        }
        if (selectedGenreIds.length > 0) {
            urlParams.push(`genres=${selectedGenreIds.join(',')}`);
        }
        if (minScore) {
            urlParams.push(`min_score=${minScore}`);
        }
        urlParams.push(`limit=20`); // Always include limit

        const apiUrl = `/api/anime?${urlParams.join('&')}`;

        // Only make the API call if there's a search term or any filter is applied
        if (!actualQuery && type === "all" && sort === "score" && genres.length === 0 && !minScore) {
            setAnime([]);
            setLoading(false);
            return; // Exit early if no search term and no filters
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch anime: ${response.status}`);
        }
        const data = await response.json();
        setAnime(data.data);
      } catch (err) {
        setError(err.message);
        console.error("Home page search error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if genreMap is populated
    if (Object.keys(genreMap).length > 0) {
      fetchAnime();
    }
  }, [debouncedSearchTerm, type, sort, genres, minScore, genreMap]);

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
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <Link to="/" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to Home
      </Link>
      <h1 className="text-4xl font-bold text-center mb-8">Search Results</h1>

      <form className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 flex flex-col space-y-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search-term" className="block text-lg font-medium mb-2">Search Term:</label>
          <input
            id="search-term"
            type="text"
            placeholder="e.g., Naruto"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="type-filter" className="block text-lg font-medium mb-2">Type:</label>
          <select
            id="type-filter"
            value={type}
            onChange={handleTypeChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Sort Order */}
        <div>
          <label htmlFor="sort-order" className="block text-lg font-medium mb-2">Sort By:</label>
          <select
            id="sort-order"
            value={sort}
            onChange={handleSortChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="score">Score</option>
            <option value="popularity">Popularity</option>
            <option value="start_date">Start Date</option>
            <option value="members">Members</option>
          </select>
        </div>

        {/* Minimum Score Filter */}
        <div>
          <label htmlFor="min-score" className="block text-lg font-medium mb-2">Minimum Score:</label>
          <input
            id="min-score"
            type="number"
            min="0"
            max="10"
            step="0.1"
            placeholder="e.g., 7.5"
            value={minScore}
            onChange={handleMinScoreChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Genres Multi-select */}
        <div>
            <h3 className="block text-lg font-medium mb-2">Genres:</h3>
            <div className="flex flex-wrap gap-2">
                {/* Ensure allGenres is populated and available */}
                {allGenres.map((genre) => (
                    <label
                        key={genre}
                        className="flex items-center cursor-pointer px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 transition duration-200">
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
      {!loading && !error && anime.length === 0 && debouncedSearchTerm && (
        <p className="text-center text-lg mt-8">No anime found for "{searchTerm}" with the applied filters.</p>
      )}
      {!loading && !error && anime.length === 0 && !debouncedSearchTerm && (type !== "all" || sort !== "score" || genres.length > 0 || minScore) && (
        <p className="text-center text-lg mt-8">No anime found with the applied filters.</p>
      )}
       {!loading && !error && anime.length === 0 && !debouncedSearchTerm && type === "all" && sort === "score" && genres.length === 0 && !minScore && (
        <p className="text-center text-lg mt-8">Start searching or apply filters to find anime.</p>
      )}
    </div>
  );
}

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
