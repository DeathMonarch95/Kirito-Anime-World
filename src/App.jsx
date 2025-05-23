// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import AnimeDetailPage from './AnimeDetailPage';
import FavoritesPage from './FavoritesPage';
import Layout from './components/Layout';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}> {/* Added future flags */}
      <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}