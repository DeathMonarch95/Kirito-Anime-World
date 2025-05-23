import { Link } from "react-router-dom";

export default function AnimeCard({ anime }) {
  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md
                 hover:shadow-lg hover:scale-102 transition-all duration-300 transform block" /* Added transform, shadow-md, hover:scale-102 */
    >
      <img
        src={anime.images.jpg.image_url}
        alt={anime.title}
        className="w-full h-56 object-cover transform hover:scale-105 transition-transform duration-300" /* Image zoom on hover */
      />
      <div className="p-4">
        <h2 className="font-bold text-lg text-primary-blue-700 dark:text-primary-blue-300 mb-1 line-clamp-2"> {/* Use new color, line-clamp */}
          {anime.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Score: {anime.score ?? "N/A"}</p> {/* Use new gray color */}
      </div>
    </Link>
  );
}