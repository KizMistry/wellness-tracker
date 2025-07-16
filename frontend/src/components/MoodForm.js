import React, { useState } from 'react';
import { moodOptions } from "../constants/moodOptions";


const MoodForm = ({ userId, onMoodSubmitted }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [customMood, setCustomMood] = useState('');
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    const API_BASE = process.env.REACT_APP_API_BASE_URL;

    const moodToSubmit = customMood.trim() || selectedMood?.label;

    if (!moodToSubmit) {
      setMessage("❌ Please select or enter a mood.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/moods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, mood: moodToSubmit, note }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`✅ Mood logged!
          `// Mood ID: ${data.id}
            );
        setSelectedMood(null);
        setCustomMood('');
        onMoodSubmitted();
        setNote('');
      } else {
        const err = await response.json();
        setMessage(`❌ Error: ${err.message || 'Failed to log mood.'}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Network Error");
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 my-4">
      <h2>Log a Mood</h2>
      <form onSubmit={handleSubmit}>
        <label>Choose a mood:</label>
        <div className="preset-moods">
          {moodOptions.map((m, index) => (
            <button
              key={index}
              type="button"
              className={`mood-btn ${
                selectedMood?.label === m.label ? 'selected' : ''
              }`}
              onClick={() => setSelectedMood(m)}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        <label>Or write your own mood:</label>
        <input
          type="text"
          value={customMood}
          onChange={(e) => setCustomMood(e.target.value)}
          placeholder="Type a custom mood..."
        />
        <label className="block mb-1 text-sm font-medium">Add a note (optional):</label>
  <textarea
    value={note}
    onChange={(e) => setNote(e.target.value)}
    className="w-full p-2 border rounded"
    placeholder="Write anything about how you feel..."
  />
        <div>
  
</div>


        <button type="submit" className="submit-btn">
          Submit Mood
        </button>

        {message && <p className="feedback">{message}</p>}
      </form>
    </div>
  );
};

export default MoodForm;
