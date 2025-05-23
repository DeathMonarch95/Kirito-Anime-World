// src/components/Layout.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Layout({ children, darkMode, setDarkMode }) {
  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-950 text-gray-50' : 'bg-gray-50 text-gray-900'}`}>
      <header className="p-4 shadow-md bg-gray-100 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="font-bold text-2xl text-primary-blue-700 dark:text-primary-blue-300 hover:text-primary-blue-900 dark:hover:text-primary-blue-100 transition duration-200 transform hover:scale-105" // Enhanced hover
          >
            Kirito Anime World
          </Link>
          <div className="flex gap-6 items-center">
            <Link
              to="/favorites"
              className="text-primary-blue-600 dark:text-primary-blue-400 hover:underline hover:text-primary-blue-800 dark:hover:text-primary-blue-200 transition duration-200 font-medium text-lg" // Enhanced hover
            >
              Favorites
            </Link>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 transform active:scale-95 shadow-sm" // Enhanced button styling
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? 'Light ☀️' : 'Dark 🌙'}
            </button>
          </div>
        </div>
      </header>
      <main className="py-8">{children}</main>
      <footer className="py-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        © {new Date().getFullYear()} Kirito Anime World. All rights reserved.
      </footer>
    </div>
  );
}