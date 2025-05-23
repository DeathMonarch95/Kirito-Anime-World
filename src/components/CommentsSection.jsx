// src/components/CommentsSection.jsx
import React, { useEffect, useState } from 'react';

export default function CommentsSection({ animeId }) {
  const storageKey = `comments-${animeId}`;
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0); // Initialize as number
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) setComments(JSON.parse(stored));
  }, [storageKey]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || rating === 0) {
      alert("Please provide a comment and a rating.");
      return;
    }

    setSubmitting(true);
    const newEntry = { text, rating, date: new Date().toLocaleString(), id: Date.now() }; // Add unique ID
    const updated = [newEntry, ...comments];
    setComments(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setText('');
    setRating(0);
    setSubmitting(false);
  };

  const renderStars = (score) => {
    return [...Array(10)].map((_, i) => ( // 10 stars for rating
      <span
        key={i}
        className={`text-xl ${score > i ? 'text-accent-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"> {/* Consistent card styling */}
      <h3 className="text-2xl font-bold mb-4 text-primary-blue-700 dark:text-primary-blue-300">Comments & Ratings</h3>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        {/* Rating Input */}
        <div>
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating:</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                type="button" // Important to prevent form submission
                onClick={() => setRating(star)}
                className={`text-3xl transition-colors duration-200 ${
                  rating >= star ? 'text-accent-yellow-500' : 'text-gray-400 dark:text-gray-600 hover:text-accent-yellow-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">You rated this: {rating}/10</p>}
        </div>

        {/* Comment Textarea */}
        <div>
          <label htmlFor="comment-text" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Your Comment:</label>
          <textarea
            id="comment-text"
            rows="4"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts about this anime..."
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-300 resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-primary-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-blue-700
                     focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:ring-offset-2
                     dark:bg-primary-blue-700 dark:hover:bg-primary-blue-800 transition duration-300 transform active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div>
        <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">User Comments</h4>
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No comments yet. Be the first to leave one!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="border-b border-gray-200 dark:border-gray-700 py-4 last:border-b-0">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">{c.date}</div>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">Rating:</span>
                  {renderStars(c.rating)}
                </div>
              </div>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{c.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}