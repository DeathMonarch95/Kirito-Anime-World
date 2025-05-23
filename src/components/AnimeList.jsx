import AnimeCard from "./AnimeCard";
import AnimeListSkeleton from "./AnimeListSkeleton"; // Import the new skeleton component

export default function AnimeList({ anime, loading }) { // Added loading prop
  if (loading) {
    return <AnimeListSkeleton />;
  }
  if (!anime || anime.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No anime to display.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"> {/* More columns for larger screens */}
      {anime.map((a) => (
        <AnimeCard key={a.mal_id} anime={a} />
      ))}
    </div>
  );
}