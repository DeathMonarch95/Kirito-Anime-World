// src/components/AnimeDetail.jsx (This file already exists and is good)
import React from "react";

export default function AnimeDetail({ anime }) {
  if (!anime) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{anime.title}</h1>
      <img
        src={anime.images?.jpg.large_image_url}
        alt={anime.title}
        className="rounded w-full max-h-[500px] object-cover mb-6"
      />

      {/* Trailer */}
      {anime.trailer?.embed_url && (
        <div className="mb-6 aspect-w-16 aspect-h-9">
          <iframe
            src={anime.trailer.embed_url}
            title="Trailer"
            allowFullScreen
            className="w-full h-full rounded"
          />
        </div>
      )}

      <p className="mb-4">{anime.synopsis}</p>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <strong>Type:</strong> {anime.type}
        </div>
        <div>
          <strong>Status:</strong> {anime.status}
        </div>
        <div>
          <strong>Episodes:</strong> {anime.episodes ?? "?"}
        </div>
        <div>
          <strong>Score:</strong> {anime.score ?? "N/A"}
        </div>
        <div>
          <strong>Rating:</strong> {anime.rating}
        </div>
        <div>
          <strong>Aired:</strong> {anime.aired?.string ?? "N/A"}
        </div>
      </div>

      {/* Genres */}
      <div className="mb-6">
        <strong>Genres:</strong>{" "}
        {anime.genres.map((g) => (
          <span
            key={g.mal_id}
            className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mb-2"
          >
            {g.name}
          </span>
        ))}
      </div>
    </div>
  );
}