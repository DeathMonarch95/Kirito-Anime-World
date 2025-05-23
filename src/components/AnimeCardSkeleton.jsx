// src/components/AnimeCardSkeleton.jsx
import React from 'react';

export default function AnimeCardSkeleton() {
  return (
    <div className="bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-md animate-pulse h-80 flex flex-col">
      <div className="w-full h-56 bg-gray-300 dark:bg-gray-600"></div> {/* Image placeholder */}
      <div className="p-4 flex-grow flex flex-col justify-center">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div> {/* Title placeholder */}
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div> {/* Score placeholder */}
      </div>
    </div>
  );
}