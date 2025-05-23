// src/components/AnimeListSkeleton.jsx
import React from 'react';

export default function AnimeListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, index) => ( // Display 6 skeleton cards
        <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-md">
          <div className="w-full h-48 bg-gray-300 dark:bg-gray-600"></div> {/* Image placeholder */}
          <div className="p-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div> {/* Title placeholder */}
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div> {/* Score placeholder */}
          </div>
        </div>
      ))}
    </div>
  );
}