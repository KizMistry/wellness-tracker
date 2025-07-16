import React, { useEffect, useState, useRef } from "react";
import { moodOptions } from "../constants/moodOptions";

const MoodHistory = ({ userId, triggerRefresh, range, customRange }) => {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editNoteText, setEditNoteText] = useState("");
  const newestMoodRef = useRef(null);
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const url =
          range === "custom"
            ? `${API_BASE}/moods?user_id=${userId}&range=custom&start=${customRange.start}&end=${customRange.end}`
            : `${API_BASE}/moods?user_id=${userId}&range=${range}`;

        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data)) {
          setMoods(data);
        } else {
          console.warn("Unexpected response format:", data);
          setMoods([]);
        }
      } catch (err) {
        console.error("Failed to fetch mood history:", err);
        setMoods([]);
      } finally {
        setLoading(false);
      }
    };

    // if (userId) fetchMoods();
    if (
      userId &&
      (range !== "custom" || (customRange.start && customRange.end))
    ) {
      fetchMoods();
    }
  }, [userId, triggerRefresh, range, customRange]);

  useEffect(() => {
    if (newestMoodRef.current) {
      newestMoodRef.current.classList.add("flash");
      const timeout = setTimeout(() => {
        newestMoodRef.current.classList.remove("flash");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [moods]);

  const handleDelete = async (id) => {
    await fetch(`${API_BASE}/moods/${id}`, {
      method: "DELETE",
    });
    setMoods(moods.filter((m) => m.id !== id));
    triggerRefresh();
  };

  const handleEdit = (id, currentMood, currentNote) => {
    setEditingId(id);
    setEditValue(currentMood);
    setEditNoteText(currentNote || "");
  };

  const handleSave = async (id) => {
    await fetch(`${API_BASE}/moods/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood: editValue, note: editNoteText }),
    });

    setEditingId(null);
    setMoods(
      moods.map((m) =>
        m.id === id ? { ...m, mood: editValue, note: editNoteText } : m
      )
    );
    triggerRefresh();
  };

  if (loading) return <p className="loading">Loading mood history...</p>;
  if (!Array.isArray(moods) || moods.length === 0)
    return <p className="loading">No moods logged yet.</p>;

  return (
    <div className="bg-white shadow rounded-xl p-6 my-4">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
        Mood History
      </h2>
      <ul className="mood-list">
        {moods.map((mood, idx) => {
          const isNewest = idx === 0;
          const isEditing = editingId === mood.id;

          return (
            <li
              key={mood.id}
              ref={isNewest ? newestMoodRef : null}
              className="mood-item"
            >
              {isEditing ? (
                <>
                  {/* Mood Buttons */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {moodOptions.map(({ emoji, label }) => (
                      <button
                        key={label}
                        onClick={() => setEditValue(label)}
                        className={`px-2 py-1 rounded-md border text-sm mood-btn preset-moods ${
                          editValue === label
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        <span className="mr-1">{emoji}</span> {label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Mood Input */}
                  <input
                    type="text"
                    className="edit-input mb-2"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Or type a custom mood..."
                  />

                  {/* Note Input */}
                  <input
                    type="text"
                    className="edit-input mt-1"
                    value={editNoteText}
                    onChange={(e) => setEditNoteText(e.target.value)}
                    placeholder="Note (optional)"
                  />
                </>
              ) : (
                <>
                  <span className="mood-text">{mood.mood}</span>
                  {mood.note && (
                    <p className="text-sm text-gray-600 italic mt-1">
                      {mood.note}
                    </p>
                  )}
                </>
              )}

              <div className="mood-meta">
                <span className="timestamp">
                  {new Date(mood.timestamp).toLocaleString()}
                </span>
                <div className="action-buttons">
                  {isEditing ? (
                    <button
                      className="save-btn"
                      onClick={() => handleSave(mood.id)}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(mood.id, mood.mood, mood.note)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(mood.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MoodHistory;
