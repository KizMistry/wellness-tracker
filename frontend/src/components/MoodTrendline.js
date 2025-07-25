import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const moodScoreMap = {
  angry: 1,
  sad: 2,
  worried: 3,
  tired: 4,
  neutral: 5,
  content: 6,
  motivated: 7,
  happy: 8,
  ecstatic: 9,
};

const MoodTrendline = ({ userId, triggerRefresh, range, customRange }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
    if (!userId) return;
    if (range === "custom" && (!customRange.start || !customRange.end)) return;
    const url =
      range === "custom"
        ? `${API_BASE}/moods?user_id=${userId}&range=custom&start=${customRange.start}&end=${customRange.end}`
        : `${API_BASE}/moods?user_id=${userId}&range=${range}`;

    fetch(url)
      .then((res) => res.json())
      .then((moods) => {
        const chartData = moods
          .map((entry) => {
            const score = moodScoreMap[entry.mood?.toLowerCase()] ?? null;
            if (score === null) return null; // Skip custom/unknown moods
            return {
              //   timestamp: entry.timestamp.split(" ")[0],
              timestamp: new Date(entry.timestamp).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              }),
              score,
              label: entry.mood,
            };
          })
          .filter(Boolean)
          .reverse();

        setData(chartData); // So it shows oldest → newest
      })
      .catch((err) => {
        console.error("Failed to fetch mood data:", err);
      });
  }, [userId, triggerRefresh, range, customRange]);

  return (
    <div className="bg-white rounded-xl shadow p-6 my-6">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
        Mood Trendline
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 12, angle: -45, dy: 10 }}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis domain={[0, 9]} ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]} />
          <Tooltip
            formatter={(value, name, props) => [
              `${value} (${props.payload.label})`,
              "Score",
            ]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodTrendline;
