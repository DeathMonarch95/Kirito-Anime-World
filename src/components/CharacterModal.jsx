// src/components/CharacterModal.jsx
import React from 'react';

export default function CharacterModal({ character, onClose, voiceActors }) {
  if (!character) return null;

  const va = voiceActors?.[0]; // Assuming only one voice actor is displayed

  const handleVoiceActorClick = (vaId) => {
    // In a real application, you would navigate to a VA detail page:
    // navigate(`/voice-actor/${vaId}`);
    console.log(`Clicked Voice Actor ID: ${vaId}. Implement navigation to VA detail page here.`);
    alert(`Voice Actor: ${va.name}. Full bio feature coming soon! (Check console for ID: ${vaId})`);
    // Optionally close the character modal when navigating to VA page
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-95 opacity-0 animate-scale-in transition-all duration-300">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-primary-blue-700 dark:text-primary-blue-300">
              {character.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-3xl font-bold transition duration-200"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <img
              src={character.images?.jpg.image_url}
              alt={character.name}
              className="w-full sm:w-1/3 rounded-lg object-cover shadow-md flex-shrink-0"
            />
            <div className="flex-grow">
              <p className="text-gray-700 dark:text-gray-300 mb-3 text-lg">
                **Role:** {character.role}
              </p>
              {va && (
                <div className="mb-3">
                  <span className="text-gray-700 dark:text-gray-300 text-lg">
                    **Voice Actor:**{' '}
                  </span>
                  <button
                    onClick={() => handleVoiceActorClick(va.person.mal_id)} // Use button for clickability
                    className="font-semibold text-primary-blue-600 dark:text-primary-blue-400 hover:underline cursor-pointer transition-colors duration-200"
                  >
                    {va.name} ({va.language})
                  </button>
                  {va.person?.images?.jpg.image_url && (
                    <img
                      src={va.person.images.jpg.image_url}
                      alt={va.person.name}
                      className="w-20 h-20 rounded-full object-cover mt-2 shadow-sm"
                    />
                  )}
                </div>
              )}
              {/* Add more character details if available from your API */}
              {/* Example: character.about field, etc. */}
            </div>
          </div>

          {/* You could add a section for "Other Anime Roles" for the VA here
              This would require another API call to Jikan by person_id or similar */}

        </div>
      </div>
    </div>
  );
}