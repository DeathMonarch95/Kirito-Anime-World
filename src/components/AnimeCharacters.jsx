// src/components/AnimeCharacters.jsx
import React, { useState } from "react";
import CharacterModal from "./CharacterModal"; // Import the new modal component

export default function AnimeCharacters({ characters }) {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedVoiceActors, setSelectedVoiceActors] = useState([]);

  const openCharacterModal = (character, voiceActors) => {
    setSelectedCharacter(character);
    setSelectedVoiceActors(voiceActors);
  };

  const closeCharacterModal = () => {
    setSelectedCharacter(null);
    setSelectedVoiceActors([]);
  };

  if (!characters || characters.length === 0) {
    return (
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-primary-blue-700 dark:text-primary-blue-300">Characters</h2>
        <p className="text-gray-500 dark:text-gray-400">No characters found.</p>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-3 text-primary-blue-700 dark:text-primary-blue-300">Characters</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {characters.map(({ character, role, voice_actors }) => (
          <div
            key={character.mal_id}
            className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 shadow-sm
                       hover:shadow-md hover:scale-102 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
            onClick={() => openCharacterModal(character, voice_actors)}
          >
            <img
              src={character.images?.jpg.image_url}
              alt={character.name}
              className="w-20 h-20 object-cover rounded-full mb-2 border-2 border-primary-blue-400 shadow-md" // Changed from w-24 h-24 to w-20 h-20
            />
            <div className="font-semibold text-gray-800 dark:text-gray-100 text-base">{character.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{role}</div>
            {voice_actors.length > 0 && (
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                VA: {voice_actors[0].name}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          voiceActors={selectedVoiceActors}
          onClose={closeCharacterModal}
        />
      )}
    </section>
  );
}