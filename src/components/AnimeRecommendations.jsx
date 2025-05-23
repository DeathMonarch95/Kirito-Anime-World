import React from "react";
import { Link } from "react-router-dom";

export default function AnimeRecommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-semibold mb-3 text-primary-blue-700 dark:text-primary-blue-300">More Like This</h2>
        <p className="text-gray-500 dark:text-gray-400">No related anime found.</p>
      </section>
    );
  }

  return (
    <section className="mb-6"> {/* Added margin-bottom for consistent spacing */}
      <h2 className="text-2xl font-semibold mb-2 text-primary-blue-700 dark:text-primary-blue-300">More Like This</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Discover other anime similar to this one, or what other users have enjoyed.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {recommendations.map(({ entry }) => (
          <Link
            to={`/anime/${entry.mal_id}`}
            key={entry.mal_id}
            className="block bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2
                       shadow-sm hover:shadow-md hover:scale-102 transition-all duration-300 transform text-center"
          >
            <img
              src={entry.images?.jpg.image_url}
              alt={entry.title}
              className="w-full h-40 object-cover rounded mb-2 shadow-sm"
            />
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
              {entry.title}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}