import React, { useEffect, useState } from "react";

const moodScoreMap = {
  angry: 1,
  disappointed: 2,
  anxious: 3,
  tired: 4,
  neutral: 5,
  sad: 6,
  happy: 7,
  excited: 8,
};

const MoodSummary = ({ userId, range, customRange, triggerRefresh }) => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const API_BASE = process.env.REACT_APP_API_BASE_URL;

    const url =
      range === "custom"
        ? `${API_BASE}/moods?user_id=${userId}&range=custom&start=${customRange.start}&end=${customRange.end}`
        : `${API_BASE}/moods?user_id=${userId}&range=${range}`;

    fetch(url)
      .then((res) => res.json())
      .then((moods) => {
        const allMoods = moods
          .map((m) => m.mood?.toLowerCase())
          .filter(Boolean);
        const scores = allMoods
          .map((mood) => moodScoreMap[mood])
          .filter((s) => s !== undefined);

        const moodCounts = {};
        allMoods.forEach((mood) => {
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });

        const totalLogged = allMoods.length;
        const average =
          scores.length > 0
            ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
            : "N/A";

        const mostFrequent = Object.entries(moodCounts).reduce(
          (a, b) => (b[1] > a[1] ? b : a),
          ["None", 0]
        )[0];

        setSummary({
          averageScore: average,
          mostFrequentMood: mostFrequent,
          totalMoods: totalLogged,
        });
      })

      .catch((err) => {
        console.error("Failed to fetch summary data:", err);
      });
  }, [userId, range, customRange, triggerRefresh]);

  if (!summary) return null;

  return (
    <div className="bg-white shadow rounded-xl p-6 my-4">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">Mood Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-500">Average Mood Score</p>
          <p className="text-lg font-bold">{summary.averageScore}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Most Frequent Mood</p>
          <p className="text-lg font-bold capitalize">
            {summary.mostFrequentMood}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Moods (including custom)</p>
          <p className="text-lg font-bold">{summary.totalMoods}</p>
        </div>
      </div>
    </div>
  );
};

export default MoodSummary;
